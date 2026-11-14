
/*
    MARS OUTPOST COMMAND
    SCIENTIFIC DATA AND MISSION SCENARIOS

    These are simulated gameplay readings, not live NASA observations.
*/

const marsScience = {

    climate: {
        instrument: "Mars Climate Sounder",
        source: "NASA / Mars Reconnaissance Orbiter",

        url: "https://atmos.nmsu.edu/pdsd/archive/data/mro-m-mcs-5-ddr-v62/",

        measures: [
            "Atmospheric temperature",
            "Atmospheric pressure",
            "Dust opacity",
            "Water-ice clouds"
        ],

        explanation:
            "The Mars Climate Sounder studies the Martian atmosphere. " +
            "Its measurements help scientists understand temperature " +
            "patterns, dust and clouds.",

        gameUse:
            "Environmental changes, temperature drops and dust storms."
    },

    geology: {
        instrument: "CheMin",
        source: "NASA / Mars Science Laboratory",

        url: "https://pds-geosciences.wustl.edu/missions/msl/chemin.htm",

        method: "X-ray diffraction",

        measures: [
            "Mineral identification",
            "Mineral abundance",
            "Rock and soil composition"
        ],

        explanation:
            "CheMin uses X-ray diffraction to identify minerals in " +
            "rock and soil samples. Different minerals reveal clues " +
            "about how the Martian environment formed and changed.",

        gameUse:
            "Soil analysis, geological discoveries and research decisions."
    }

};


// MISSION SCENARIOS

const missions = [

    {
        sol: 1,

        title: "ATMOSPHERIC TEMPERATURE DROP",

        type: "ENVIRONMENTAL ALERT",

        briefing:
            "Commander, atmospheric monitoring has detected a significant " +
            "drop in external temperature near ARES Research Station. " +
            "The habitat insulation system is showing unusual fluctuations. " +
            "The crew is currently safe, but prolonged exposure to low " +
            "temperatures could place additional strain on the station.",

        science: "climate",

        scienceInfo:
            "Mars has a very thin atmosphere, which cannot retain heat " +
            "as effectively as Earth's atmosphere. Temperatures can " +
            "change significantly, making habitat insulation essential.",

        environment:
            "External temperature: -68°C | Atmospheric conditions: Unstable",

        crewMessage:
            "ENGINEER: The heating system is making a strange noise. " +
            "I'm choosing to believe that's normal.",

        choices: [

            {
                text: "Increase habitat heating.",

                effects: {
                    oxygen: 0,
                    power: -14,
                    habitat: 8,
                    crew: 8
                },

                result:
                    "Habitat temperatures stabilise. The crew is comfortable, " +
                    "but the heating system has consumed additional power.",

                explanation:
                    "Heating protects the crew and prevents internal " +
                    "temperatures from falling. However, heating systems " +
                    "require electricity, reducing the station's power reserves."
            },

            {
                text: "Inspect and repair the insulation system.",

                effects: {
                    oxygen: 0,
                    power: -7,
                    habitat: 12,
                    crew: 3
                },

                result:
                    "The engineering team identifies a weakness in the " +
                    "insulation. Repairs improve heat retention.",

                explanation:
                    "Improving insulation reduces heat escaping from the " +
                    "habitat. This can reduce the amount of electricity " +
                    "needed to maintain a comfortable temperature."
            },

            {
                text: "Conserve power and monitor conditions.",

                effects: {
                    oxygen: 0,
                    power: 3,
                    habitat: -12,
                    crew: -8
                },

                result:
                    "Power reserves are preserved, but the habitat becomes " +
                    "colder. The crew reports discomfort.",

                explanation:
                    "Reducing heating saves electricity, but allows the " +
                    "habitat temperature to fall. This demonstrates the " +
                    "trade-off between conserving resources and protecting " +
                    "crew wellbeing."
            }

        ]

    },


    {
        sol: 2,

        title: "UNUSUAL SOIL COMPOSITION",

        type: "SCIENTIFIC DISCOVERY",

        briefing:
            "Commander, a soil sample collected near the research station " +
            "has produced an unexpected mineral composition. The geological " +
            "team has requested additional analysis. However, laboratory " +
            "equipment will require additional electrical power.",

        science: "geology",

        scienceInfo:
            "Minerals provide clues about the history of a planet. " +
            "For example, some minerals can form in the presence of water. " +
            "Identifying them helps scientists investigate whether Mars " +
            "once had conditions suitable for liquid water.",

        environment:
            "Surface conditions: Stable | Geological sample: Under analysis",

        crewMessage:
            "SCIENTIST: I have found something interesting in the sample. " +
            "Please tell me we have enough power to investigate it.",

        choices: [

            {
                text: "Conduct a full geological analysis.",

                effects: {
                    oxygen: 0,
                    power: -15,
                    habitat: 0,
                    crew: 12
                },

                result:
                    "The laboratory completes an extended analysis. " +
                    "The crew makes an important geological discovery.",

                explanation:
                    "CheMin uses X-ray diffraction to identify minerals. " +
                    "A more detailed investigation can provide useful " +
                    "scientific information, but laboratory equipment " +
                    "consumes electricity."
            },

            {
                text: "Run a limited sample analysis.",

                effects: {
                    oxygen: 0,
                    power: -6,
                    habitat: 0,
                    crew: 5
                },

                result:
                    "A shorter analysis identifies several minerals. " +
                    "The team obtains useful results while conserving power.",

                explanation:
                    "A limited investigation provides less information " +
                    "than a full analysis, but requires fewer resources. " +
                    "This is a compromise between research and efficiency."
            },

            {
                text: "Postpone the investigation.",

                effects: {
                    oxygen: 0,
                    power: 2,
                    habitat: 0,
                    crew: -7
                },

                result:
                    "The laboratory is shut down temporarily. Power is " +
                    "preserved, but the scientific team is disappointed.",

                explanation:
                    "Postponing research conserves electrical power, " +
                    "but delays the collection of scientific information."
            }

        ]

    },


    {
        sol: 3,

        title: "APPROACHING DUST STORM",

        type: "ENVIRONMENTAL EMERGENCY",

        briefing:
            "Commander, atmospheric monitoring has detected a significant " +
            "increase in airborne dust. A regional dust storm is approaching " +
            "the research station. Reduced sunlight may affect the solar " +
            "panels, threatening the station's power supply.",

        science: "climate",

        scienceInfo:
            "Dust in the Martian atmosphere can scatter and absorb sunlight. " +
            "During a dust storm, less sunlight may reach solar panels, " +
            "reducing their ability to generate electricity.",

        environment:
            "Dust opacity: Increasing | Solar exposure: Decreasing",

        crewMessage:
            "ENGINEER: The solar panels are getting covered in dust. " +
            "This is officially not my favourite weather.",

        choices: [

            {
                text: "Activate emergency power conservation.",

                effects: {
                    oxygen: 0,
                    power: 12,
                    habitat: -3,
                    crew: -3
                },

                result:
                    "Non-essential equipment is switched off. The station " +
                    "preserves its remaining energy reserves.",

                explanation:
                    "Switching off equipment reduces electricity demand. " +
                    "This helps the station maintain essential systems " +
                    "when solar energy production decreases."
            },

            {
                text: "Prioritise essential life-support systems.",

                effects: {
                    oxygen: 5,
                    power: -9,
                    habitat: 5,
                    crew: 10
                },

                result:
                    "Life-support systems remain operational. The crew " +
                    "is protected, although power reserves decrease.",

                explanation:
                    "Life-support systems maintain essential conditions " +
                    "inside the habitat. Protecting them is important " +
                    "during environmental emergencies."
            },

            {
                text: "Attempt to restore solar panel efficiency.",

                effects: {
                    oxygen: 0,
                    power: -5,
                    habitat: -5,
                    crew: 5
                },

                result:
                    "The maintenance team attempts to improve solar " +
                    "panel performance. Conditions remain challenging.",

                explanation:
                    "Dust accumulation can reduce the amount of sunlight " +
                    "reaching solar panels. Maintenance may improve their " +
                    "performance, but working during a storm creates " +
                    "additional operational challenges."
            }

        ]

    }

];
