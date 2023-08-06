import json
import re
import sys


def calculate_calorie_requirement(dog_size, weight, activity_level, age):
    dog_data = {
        "toy": {
            4: {"low": (269, 345, 80), "mid": (318, 410, 100), "high": (369, 475, 120)},
            5: {"low": (318, 410, 100), "mid": (369, 475, 120), "high": (420, 540, 140)}
        },
        "small": {
            6: {"low": (364, 470, 110), "mid": (409, 525, 125), "high": (455, 580, 135)},
            7: {"low": (409, 525, 125), "mid": (455, 580, 135), "high": (500, 635, 155)},
            8: {"low": (452, 570, 133), "mid": (498, 625, 145), "high": (544, 680, 165)},
            9: {"low": (432, 537, 116), "mid": (458, 573, 123), "high": (484, 609, 131)},
            10: {"low": (534, 690, 165), "mid": (570, 735, 175), "high": (606, 780, 185)}
        },
        "medium": {
            12: {"low": (613, 790, 190), "mid": (650, 845, 200), "high": (688, 900, 210)},
            14: {"low": (688, 880, 210), "mid": (726, 935, 220), "high": (763, 990, 230)},
            16: {"low": (760, 980, 230), "mid": (798, 1035, 240), "high": (835, 1090, 250)},
            18: {"low": (830, 1070, 255), "mid": (868, 1125, 265), "high": (905, 1180, 275)},
            20: {"low": (898, 1115, 275), "mid": (936, 1170, 285), "high": (973, 1225, 295)},
            22: {"low": (965, 1240, 195), "mid": (1003, 1305, 205),
                 "high": (1040, 1370, 215)},
            24: {"low": (1030, 1325, 315), "mid": (1068, 1390, 325),
                 "high": (1105, 1455, 335)}
        },
        "large": {
            26: {"low": (1094, 1410, 335), "mid": (1131, 1475, 345),
                 "high": (1168, 1540, 355)},
            28: {"low": (1156, 1490, 350), "mid": (1194, 1555, 360),
                 "high": (1231, 1620, 370)},
            30: {"low": (1218, 1570, 370), "mid": (1255, 1635, 380),
                 "high": (1292, 1700, 390)},
            32: {"low": (1278, 1645, 390), "mid": (1316, 1710, 400),
                 "high": (1353, 1775, 410)},
            34: {"low": (1338, 1720, 410), "mid": (1375, 1785, 420),
                 "high": (1412, 1850, 430)},
            36: {"low": (1396, 1800, 425), "mid": (1433, 1865, 435),
                 "high": (1470, 1930, 445)},
            38: {"low": (1454, 1870, 445), "mid": (1491, 1935, 455),
                 "high": (1528, 2000, 465)},
            40: {"low": (1511, 1945, 460), "mid": (1548, 2010, 470),
                 "high": (1585, 2075, 480)}
        },
        "giant": {
            45: {"low": (1651, 2063, 505), "mid": (1712, 2130, 520),
                 "high": (1773, 2198, 535)},
            50: {"low": (1786, 2232, 545), "mid": (1847, 2300, 560),
                 "high": (1908, 2368, 575)},
            55: {"low": (1919, 2398, 585), "mid": (1980, 2465, 600),
                 "high": (2041, 2533, 615)},
            60: {"low": (2048, 2560, 625), "mid": (2109, 2628, 640),
                 "high": (2170, 2695, 655)}
        }
    }


    # Calculate calorie requirement based on dog's size, weight, and activity level
    if dog_size in dog_data:
        # Get the weight categories for the selected dog size
        weight_categories = sorted(dog_data[dog_size].keys())
        if weight < weight_categories[0]:
            weight_category = weight_categories[0]
        elif weight > weight_categories[-1]:
            weight_category = weight_categories[-1]
        else:
            weight_category = next(
                category for category in weight_categories if weight <= category
            )

        calorie_requirements = dog_data[dog_size][weight_category]
        if activity_level in calorie_requirements:
            calorie_requirement, wet_food, dry_food = calorie_requirements[activity_level]

            # Calculate percentage changes for each age between 2 months and 20 years
            percentage_changes = {
                "2M": (580 - 545) / 545,
                "4M": (768 - 520) / 520,
                "6M": (795 - 520) / 520,
                "9M": (785 - 520) / 520,
                "9Y": (500 - 401) / 401,
            }

            number = int(re.search(r'\d+', age).group())
            last_character = age[-1]
            if age == "2M":
                percentage_change = percentage_changes[age]
                calorie_requirement = int(calorie_requirement * (1 - percentage_change))
                dry_food = int(dry_food * (1 - percentage_change))
                wet_food = int(wet_food * (1 - percentage_change))

            elif last_character == 'M' and number < 12:
                percentage_change = percentage_changes[age]
                calorie_requirement = int(calorie_requirement * (1 + percentage_change))
                dry_food = int(dry_food * (1 + percentage_change))
                wet_food = int(wet_food * (1 + percentage_change))

            elif last_character == 'Y' and number > 8:
                percentage_change = percentage_changes["9Y"]
                calorie_requirement = int(calorie_requirement * (1 - percentage_change))
                dry_food = int(dry_food * (1 - percentage_change))
                wet_food = int(wet_food * (1 - percentage_change))

            return calorie_requirement, dry_food, wet_food

    return None, None, None





size = sys.argv[1]
weight = float(sys.argv[2])
activity_level = sys.argv[3]
age = sys.argv[4]

calorie_requirement, dry_food, wet_food = calculate_calorie_requirement(size, weight, activity_level, age)
print(calorie_requirement)
print(dry_food)
print(wet_food)

