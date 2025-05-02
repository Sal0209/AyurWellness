/**
 * Ayurveda Prakruti Quiz Questions
 * 
 * This file contains the quiz questions used to determine a person's Prakruti (constitution).
 * Each question has options that correspond to Vata, Pitta, and Kapha characteristics.
 */

const quizQuestions = [
    {
        id: 1,
        text: "What is your body size?",
        options: [
            {
                id: "a",
                text: "Slim",
                description: "I have a slender frame",
                value: "vata"
            },
            {
                id: "b",
                text: "Medium",
                description: "I have a medium build",
                value: "pitta"
            },
            {
                id: "c",
                text: "Large",
                description: "I have a larger frame",
                value: "kapha"
            }
        ]
    },
    {
        id: 2,
        text: "What is your body weight?",
        options: [
            {
                id: "a",
                text: "Low - difficulties in gaining weight",
                description: "I find it hard to gain weight regardless of what I eat",
                value: "vata"
            },
            {
                id: "b",
                text: "Moderate - no difficulties in gaining or losing weight",
                description: "I can gain or lose weight without much difficulty",
                value: "pitta"
            },
            {
                id: "c",
                text: "Heavy - difficulties in losing weight",
                description: "I tend to gain weight easily and find it hard to lose",
                value: "kapha"
            }
        ]
    },
    {
        id: 3,
        text: "What is your height?",
        options: [
            {
                id: "a",
                text: "Tall",
                description: "I am taller than average",
                value: "vata"
            },
            {
                id: "b",
                text: "Average",
                description: "I am of average height",
                value: "pitta"
            },
            {
                id: "c",
                text: "Short",
                description: "I am shorter than average",
                value: "kapha"
            }
        ]
    },
    {
        id: 4,
        text: "What is your bone structure?",
        options: [
            {
                id: "a",
                text: "Light, Small bones, prominent joints",
                description: "My bones are small and my joints are often visible",
                value: "vata"
            },
            {
                id: "b",
                text: "Medium bone structure",
                description: "I have a moderate, proportionate bone structure",
                value: "pitta"
            },
            {
                id: "c",
                text: "Large, broad shoulders, heavy bone structure",
                description: "I have large bones and a solid frame",
                value: "kapha"
            }
        ]
    },
    {
        id: 5,
        text: "What is your complexion?",
        options: [
            {
                id: "a",
                text: "White, pale, tans easily",
                description: "My skin is naturally pale or dull",
                value: "vata"
            },
            {
                id: "b",
                text: "Fair-skin sunburns easily",
                description: "My skin is fair and tends to burn in the sun",
                value: "pitta"
            },
            {
                id: "c",
                text: "Dark-Complexion, tans easily",
                description: "My skin has a naturally darker tone",
                value: "kapha"
            }
        ]
    },
    {
        id: 6,
        text: "What is the general feel of your skin?",
        options: [
            {
                id: "a",
                text: "Dry and thin, cool to touch, rough",
                description: "My skin feels dry and rough most of the time",
                value: "vata"
            },
            {
                id: "b",
                text: "Smooth and warm, oily T-zone",
                description: "My skin is warm to touch with oily areas",
                value: "pitta"
            },
            {
                id: "c",
                text: "Thick and moist/greasy, cold",
                description: "My skin is thick, moist, and cool to touch",
                value: "kapha"
            }
        ]
    },
    {
        id: 7,
        text: "What is the texture of your skin?",
        options: [
            {
                id: "a",
                text: "Dry, pigments and aging",
                description: "My skin shows signs of dryness and early aging",
                value: "vata"
            },
            {
                id: "b",
                text: "Freckles, many moles, redness and rashes",
                description: "My skin is sensitive and prone to redness",
                value: "pitta"
            },
            {
                id: "c",
                text: "Oily",
                description: "My skin is generally oily throughout the day",
                value: "kapha"
            }
        ]
    },
    {
        id: 8,
        text: "What is the color of your hair?",
        options: [
            {
                id: "a",
                text: "Black/Brown, dull",
                description: "My hair is dark but often lacks shine",
                value: "vata"
            },
            {
                id: "b",
                text: "Red, light brown, yellow",
                description: "My hair has reddish or lighter tones",
                value: "pitta"
            },
            {
                id: "c",
                text: "Brown",
                description: "My hair is typically brown and thick",
                value: "kapha"
            }
        ]
    },
    {
        id: 9,
        text: "What is the appearance of your hair?",
        options: [
            {
                id: "a",
                text: "Dry, black, knotted, brittle",
                description: "My hair tends to be dry and breaks easily",
                value: "vata"
            },
            {
                id: "b",
                text: "Straight, oily",
                description: "My hair is straight and tends to get oily quickly",
                value: "pitta"
            },
            {
                id: "c",
                text: "Thick, curly",
                description: "My hair is thick and has waves or curls",
                value: "kapha"
            }
        ]
    },
    {
        id: 10,
        text: "What is the shape of your face?",
        options: [
            {
                id: "a",
                text: "Long, angular, thin",
                description: "I have a narrow face with angular features",
                value: "vata"
            },
            {
                id: "b",
                text: "Heart-shaped, pointed chin",
                description: "My face is heart-shaped with a more pointed chin",
                value: "pitta"
            },
            {
                id: "c",
                text: "Large, round, full",
                description: "I have a round, full face",
                value: "kapha"
            }
        ]
    },
    {
        id: 11,
        text: "How are your eyes?",
        options: [
            {
                id: "a",
                text: "Small, active, darting, dark eyes",
                description: "My eyes are small and often in motion",
                value: "vata"
            },
            {
                id: "b",
                text: "Medium-sized, penetrating, light-sensitive eyes",
                description: "My eyes are medium-sized and sensitive to light",
                value: "pitta"
            },
            {
                id: "c",
                text: "Big, round, beautiful, glowing eyes",
                description: "I have large, expressive eyes",
                value: "kapha"
            }
        ]
    },
    {
        id: 12,
        text: "How are your eyelashes?",
        options: [
            {
                id: "a",
                text: "Scanty eyelashes",
                description: "My eyelashes are thin and few",
                value: "vata"
            },
            {
                id: "b",
                text: "Moderate eyelashes",
                description: "I have normal, average eyelashes",
                value: "pitta"
            },
            {
                id: "c",
                text: "Thick/Fused eyelashes",
                description: "My eyelashes are thick and full",
                value: "kapha"
            }
        ]
    },
    {
        id: 13,
        text: "How frequently do you tend to blink?",
        options: [
            {
                id: "a",
                text: "Excessive Blinking",
                description: "I blink my eyes frequently",
                value: "vata"
            },
            {
                id: "b",
                text: "Moderate Blinking",
                description: "I blink at a normal rate",
                value: "pitta"
            },
            {
                id: "c",
                text: "More or less stable",
                description: "I blink less frequently, with a steady gaze",
                value: "kapha"
            }
        ]
    },
    {
        id: 14,
        text: "How are your cheeks?",
        options: [
            {
                id: "a",
                text: "Wrinkled, Sunken",
                description: "My cheeks tend to be thin or hollow",
                value: "vata"
            },
            {
                id: "b",
                text: "Smooth, Flat",
                description: "My cheeks are smooth and proportionate to my face",
                value: "pitta"
            },
            {
                id: "c",
                text: "Rounded, Plump",
                description: "I have full, round cheeks",
                value: "kapha"
            }
        ]
    },
    {
        id: 15,
        text: "What is the shape of your nose?",
        options: [
            {
                id: "a",
                text: "Crooked, Narrow",
                description: "My nose is thin and may be slightly uneven",
                value: "vata"
            },
            {
                id: "b",
                text: "Pointed, Average",
                description: "My nose is average sized with a defined tip",
                value: "pitta"
            },
            {
                id: "c",
                text: "Rounded, Large open nostrils",
                description: "My nose is broad with open nostrils",
                value: "kapha"
            }
        ]
    },
    {
        id: 16,
        text: "How would you describe your teeth and gums?",
        options: [
            {
                id: "a",
                text: "Irregular, Protruding teeth, Receding gums",
                description: "My teeth may be uneven and my gums tend to recede",
                value: "vata"
            },
            {
                id: "b",
                text: "Medium-sized teeth, Reddish gums",
                description: "I have normal teeth with sometimes sensitive gums",
                value: "pitta"
            },
            {
                id: "c",
                text: "Big, White, Strong teeth, Healthy gums",
                description: "I have strong teeth and healthy gums",
                value: "kapha"
            }
        ]
    },
    {
        id: 17,
        text: "What are your lips like?",
        options: [
            {
                id: "a",
                text: "Tight, thin, dry lips which chaps easily",
                description: "My lips tend to be dry and often need moisturizing",
                value: "vata"
            },
            {
                id: "b",
                text: "Lips are soft, medium-sized",
                description: "My lips are of average thickness and softness",
                value: "pitta"
            },
            {
                id: "c",
                text: "Lips are large, soft, pink, and full",
                description: "I have naturally full lips",
                value: "kapha"
            }
        ]
    },
    {
        id: 18,
        text: "What are your nails like?",
        options: [
            {
                id: "a",
                text: "Dry, Rough, Brittle, Break",
                description: "My nails break easily and may be ridged",
                value: "vata"
            },
            {
                id: "b",
                text: "Sharp, Flexible, Pink, Lustrous",
                description: "My nails are strong but flexible with a pink tone",
                value: "pitta"
            },
            {
                id: "c",
                text: "Thick, Oily, Smooth, Polished",
                description: "My nails are thick, strong, and naturally shiny",
                value: "kapha"
            }
        ]
    },
    {
        id: 19,
        text: "How is your appetite?",
        options: [
            {
                id: "a",
                text: "Irregular, Scanty",
                description: "My hunger varies throughout the day and from day to day",
                value: "vata"
            },
            {
                id: "b",
                text: "Strong, Unbearable",
                description: "I get very hungry and need to eat regularly",
                value: "pitta"
            },
            {
                id: "c",
                text: "Slow but steady",
                description: "My appetite is consistent but I can easily skip meals",
                value: "kapha"
            }
        ]
    },
    {
        id: 20,
        text: "What kinds of tastes do you prefer?",
        options: [
            {
                id: "a",
                text: "Sweet / Sour / Salty",
                description: "I crave comforting, rich flavors",
                value: "vata"
            },
            {
                id: "b",
                text: "Sweet / Bitter / Astringent",
                description: "I enjoy a mix of sweet and bitter tastes",
                value: "pitta"
            },
            {
                id: "c",
                text: "Pungent / Bitter / Astringent",
                description: "I prefer spicy, strong flavors",
                value: "kapha"
            }
        ]
    }
];