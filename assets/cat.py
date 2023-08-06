import json
import sys


def calculate_food(weight, size):
    print("Debug: Received weight =", weight)
    print("Debug: Received size =", size)
    # Sample data for size, weight, daily calories, dry food (gm), wet food (gm)
    sample_data = [
        ("toy", 0.5, 38, 11, 38),
        ("toy", 1, 65, 18, 65),
        ("toy", 1.5, 88, 25, 88),
        ("toy", 2, 109, 31, 109),
        ("toy", 2.5, 129, 37, 129),
        ("small", 2.7, 147, 42, 147),
        ("small", 3, 166, 47, 166),
        ("small", 3.5, 183, 52, 183),
        ("small", 4, 200, 57, 200),
        ("small", 4.5, 216, 62, 216),
        ("medium", 5, 232, 66, 232),
        ("medium", 5.5, 248, 71, 248),
        ("medium", 6, 263, 75, 263),
        ("medium", 6.5, 278, 80, 278),
        ("medium", 6.7, 293, 84, 293),
        ("large", 7, 308, 99, 308),
        ("large", 7.5, 322, 92, 322),
        ("large", 8, 336, 96, 336),
        ("large", 8.5, 350, 100, 350),
        ("large", 9, 364, 104, 364),
        ("giant", 9.5, 377, 108, 377),
        ("giant", 10, 391, 112, 391),
        ("giant", 10.5, 404, 115, 404),
        ("giant", 11, 417, 119, 417),
        ("giant", 11.5, 430, 123, 430)
    ]

    # Find the closest weight and size in the sample data
    closest_data = min(sample_data, key=lambda x: abs(x[1] - weight) + abs(x[0] != size))
    _, _, calories, dry_food, wet_food = closest_data

    return calories, dry_food, wet_food


size = sys.argv[1]
weight = float(sys.argv[2])

calorie_requirement, dry_food, wet_food = calculate_food(weight, size)

output = {"calories": calorie_requirement,
          "dry": dry_food,
          "wet": wet_food}
output_json = json.dumps(output)

print(output_json)
