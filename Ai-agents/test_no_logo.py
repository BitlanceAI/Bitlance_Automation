from app.agent import GraphicAgent

def test():
    prompt = "Create a modern telehealth advertisement for 'CarePlus Telehealth'. Include online consultation icons."
    print("Testing brand overlay without a logo...")
    agent = GraphicAgent()
    
    # We pass logo_image=None
    result = agent.run_from_prompt(
        raw_prompt=prompt,
        niche="telehealth",
        image_size="1024x1024",
        logo_image=None,
    )
    
    if result.get("success"):
        print("Success! Output generated.")
        print("Saved to:", result["images"][0]["filepath"])
    else:
        print("Failed:", result)

if __name__ == "__main__":
    test()
