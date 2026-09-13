#!/usr/bin/env python3
import os
import json
import random
from datetime import datetime
from pathlib import Path
import openai

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create content directory if it doesn't exist
CONTENT_DIR = Path("content")
CONTENT_DIR.mkdir(exist_ok=True)

def generate_portfolio_item(item_type: str) -> dict:
    """Generate a single portfolio item using OpenAI"""
    
    prompts = {
        "project": "Create a compelling portfolio project showcase with a title, description, technologies used, and key achievements. Format as JSON with keys: title, description, technologies, achievements, date.",
        "case_study": "Write a detailed case study for a professional project including problem statement, solution, results, and lessons learned. Format as JSON with keys: title, problem, solution, results, lessons_learned, date.",
        "skill": "List 3-4 professional skills with proficiency levels and relevant experience. Format as JSON with keys: skills (array of {name, level, years_experience}).",
        "service": "Describe a professional service offering including service name, description, benefits, and pricing model. Format as JSON with keys: service_name, description, benefits, pricing_model, target_audience."
    }
    
    prompt = prompts.get(item_type, prompts["project"])
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f"Generate a unique and professional {item_type} for a portfolio. {prompt}"
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            item_data = json.loads(content)
        except json.JSONDecodeError:
            # If not valid JSON, create a basic structure
            item_data = {
                "type": item_type,
                "content": content,
                "date": datetime.now().isoformat()
            }
        
        return item_data
    
    except Exception as e:
        print(f"Error generating {item_type}: {e}")
        return None

def save_as_html(item: dict, filename: str) -> None:
    """Save portfolio item as HTML"""
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{item.get('title', 'Portfolio Item')}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }}
        .container {{
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #333;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }}
        .meta {{
            color: #666;
            font-size: 0.9em;
            margin: 10px 0;
        }}
        .content {{
            color: #444;
            margin-top: 20px;
        }}
        .tags {{
            margin-top: 20px;
        }}
        .tag {{
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            margin-right: 5px;
            font-size: 0.85em;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{item.get('title', 'Portfolio Item')}</h1>
        <div class="meta">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</div>
        <div class="content">
            {json.dumps(item, indent=2)}
        </div>
    </div>
</body>
</html>
"""
    
    filepath = CONTENT_DIR / filename
    filepath.write_text(html_content)
    print(f"✓ Saved HTML: {filepath}")

def save_as_markdown(item: dict, filename: str) -> None:
    """Save portfolio item as Markdown"""
    
    md_content = f"""# {item.get('title', 'Portfolio Item')}

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Details

```json
{json.dumps(item, indent=2)}
```

---

*Auto-generated portfolio content*
"""
    
    filepath = CONTENT_DIR / filename.replace('.html', '.md')
    filepath.write_text(md_content)
    print(f"✓ Saved Markdown: {filepath}")

def main():
    """Main function to generate portfolio content"""
    
    print("🤖 Starting AI Portfolio Content Generation...")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    
    # Types of content to generate
    content_types = ["project", "case_study", "skill", "service"]
    
    # Generate 2-3 random portfolio items
    num_items = random.randint(2, 3)
    print(f"📝 Generating {num_items} portfolio items...\n")
    
    for i in range(num_items):
        content_type = random.choice(content_types)
        print(f"Generating {content_type}...")
        
        item = generate_portfolio_item(content_type)
        
        if item:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_filename = f"portfolio_{content_type}_{timestamp}_{i+1}"
            
            # Save as both HTML and Markdown
            save_as_html(item, f"{base_filename}.html")
            save_as_markdown(item, f"{base_filename}.html")
            print()
    
    print("✅ Portfolio content generation complete!")
    print(f"📁 Content saved to: {CONTENT_DIR}/")

if __name__ == "__main__":
    main()
