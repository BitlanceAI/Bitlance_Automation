import sys
import subprocess
import time

def run_module(script_name, provide_input=None):
    print(f"\n{'='*60}")
    print(f"🚀 RUNNING MODULE: {script_name}")
    print(f"{'='*60}\n")
    
    try:
        if provide_input:
            # Run the process and provide input (e.g., 'y' to confirm bulk email)
            subprocess.run([sys.executable, script_name], input=provide_input, text=True, check=True)
        else:
            # Run normally
            subprocess.run([sys.executable, script_name], check=True)
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error running {script_name}. Pipeline stopped.")
        sys.exit(1)
    except KeyboardInterrupt:
        print(f"\n🛑 Pipeline stopped by user during {script_name}.")
        sys.exit(0)

def main():
    print("🌟 STARTING END-TO-END AUTOMATION PIPELINE 🌟")
    print("This will run the Scraper, Bulk Mailer, and Auto-Reply Listener sequentially.\n")
    
    # Step 1: Run Data Scraper
    run_module("scraper.py")
    
    # Step 2: Run Bulk Mailer
    # We pass 'y\n' to automatically confirm the "Proceed to send emails? (y/n)" prompt
    print("Waiting 3 seconds before starting Module 2...")
    time.sleep(3)
    run_module("bulk_mailer.py", provide_input="y\n")
    
    # Step 3: Run Auto-Reply Listener
    print("Waiting 3 seconds before starting Module 3...")
    time.sleep(3)
    print("⚠️  NOTE: The Auto-Reply Listener runs continuously.")
    print("   It will keep running until you press Ctrl+C.")
    run_module("auto_reply.py")

if __name__ == "__main__":
    main()
