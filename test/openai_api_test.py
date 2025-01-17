from openai import OpenAI


client = OpenAI(
  api_key="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"
)


completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "developer", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": "Write a haiku about recursion in programming."
        }
    ]
)

print(completion.choices[0].message)