import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Ensure fallback variables
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

// Create the Google sheets MCP Server instance
const server = new Server(
    {
        name: "bitlance-google-sheets-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Decrypt helper for the backend to use (if the agent passes the raw encrypted DB string)
// Note: In typical MCP flows, the client (Claude/Cursor) might just provide the Spreadsheet ID
// and the Server uses its own ENV Service Account, OR the user provides the auth details in the tool call.
// Since the Bitlance DB stores this per user, we will ask the caller to provide the auth details.

/**
 * Helper to get an authenticated Google Sheets client
 */
async function getSheetsClient(clientEmail, privateKey) {
    // Fix escaped newlines in the private key
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT(clientEmail, null, formattedPrivateKey, [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
    ]);

    return google.sheets({ version: "v4", auth });
}

// -------------------------------------------------------------
// Register Tools
// -------------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_google_sheet_rows",
                description: "Reads rows from a Google Sheet. Useful for retrieving lists of blog topics, keywords, etc.",
                inputSchema: {
                    type: "object",
                    properties: {
                        spreadsheetId: { type: "string", description: "The ID of the Google Spreadsheet to read." },
                        clientEmail: { type: "string", description: "The Google Service Account client email." },
                        privateKey: { type: "string", description: "The Google Service Account private key." },
                    },
                    required: ["spreadsheetId", "clientEmail", "privateKey"],
                },
            },
            {
                name: "queue_blog_from_sheet_row",
                description: "Sends a request to the Bitlance Backend to queue a blog for generation based on sheet data.",
                inputSchema: {
                    type: "object",
                    properties: {
                        userToken: { type: "string", description: "The authorization JWT token of the Bitlance user." },
                        title: { type: "string", description: "The title of the blog post to generate." },
                        niche: { type: "string", description: "The niche or industry. Defaults to General." },
                        keywords: { type: "string", description: "Comma-separated SEO keywords." },
                    },
                    required: ["userToken", "title"],
                },
            },
        ],
    };
});

// -------------------------------------------------------------
// Handle Tool Execution
// -------------------------------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        if (name === "read_google_sheet_rows") {
            const { spreadsheetId, clientEmail, privateKey } = args;

            const sheets = await getSheetsClient(clientEmail, privateKey);

            // Fetch spreadsheet metadata to get the first sheet's name
            const metadata = await sheets.spreadsheets.get({ spreadsheetId });
            const firstSheetName = metadata.data.sheets[0].properties.title;

            // Fetch values from the first sheet
            const sheetResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${firstSheetName}!A:Z`,
            });

            const rows = sheetResponse.data.values || [];
            if (rows.length === 0) {
                return {
                    content: [{ type: "text", text: "The Google Sheet is empty." }],
                    isError: false,
                };
            }

            // Format as JSON object array based on headers for better LLM context
            const headers = rows[0].map(h => h.trim());
            const jsonData = rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || "";
                });
                return obj;
            });

            return {
                content: [{ type: "text", text: JSON.stringify(jsonData, null, 2) }],
                isError: false,
            };
        }

        if (name === "queue_blog_from_sheet_row") {
            const { userToken, title, niche, keywords } = args;

            const payload = {
                title,
                niche: niche || "General",
                keywords: keywords || "",
            };

            try {
                const response = await axios.post(`${API_BASE_URL}/api/admin/auto-blog/schedule`, payload, {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "application/json",
                    },
                });

                return {
                    content: [
                        {
                            type: "text",
                            text: `Successfully queued blog: "${title}". Response: ${JSON.stringify(response.data)}`,
                        },
                    ],
                    isError: false,
                };
            } catch (axiosError) {
                const errorMsg = axiosError.response?.data?.error || axiosError.message;
                return {
                    content: [{ type: "text", text: `Failed to queue blog. Backend returned: ${errorMsg}` }],
                    isError: true,
                };
            }
        }

        // Tool not found
        return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
        };
    } catch (error) {
        console.error("Tool execution error:", error);
        return {
            content: [{ type: "text", text: `An error occurred: ${error.message}` }],
            isError: true,
        };
    }
});

// -------------------------------------------------------------
// Start the Server
// -------------------------------------------------------------
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Bitlance Google Sheets MCP Server running on stdio.");
}

main().catch((err) => {
    console.error("Fatal error running MCP server:", err);
    process.exit(1);
});
