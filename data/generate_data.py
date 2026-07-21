import pandas as pd
import random

# Create dummy data
data = {
    'width': [random.randint(10, 50) for _ in range(100)],
    'height': [random.randint(10, 50) for _ in range(100)],
    'material': [random.choice(['wood', 'metal', 'plastic']) for _ in range(100)],
    'price': [random.randint(200, 1000) for _ in range(100)]
}

df = pd.DataFrame(data)

# Save to the data folder
df.to_excel('data/sales_data.xlsx', index=False)
print("Successfully created data/sales_data.xlsx!")