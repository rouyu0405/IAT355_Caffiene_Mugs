//Scroll Active Highlighter
// Map sections → nav items
const navItems = document.querySelectorAll("#sideNav .nav-item");

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const sectionId = entry.target.id;

            if (entry.isIntersecting) {
                // Apply active state
                navItems.forEach((item) => {
                    const img = item.querySelector("img");

                    if (item.dataset.section === sectionId) {
                        item.classList.add("active");
                        img.src = img.dataset.active;
                    } else {
                        item.classList.remove("active");
                        img.src = img.dataset.default;
                    }
                });
            }
        });
    },
    {
        threshold: 0.2 // Adjust page length sestivity
    }
);

// Observe each section
document.querySelectorAll("section[id]").forEach((sec) => {
    sectionObserver.observe(sec);
});


// Base spec without fixed width/height
const baseSpec = {
    data: { url: "caffeine.csv" },
    mark: "circle",

    autosize: {
        type: "fit",
        contains: "padding"
    },

    selection: {
        genderSel: {
            type: "single",
            fields: ["Gender"],
            bind: {
                input: "select",
                options: [null, "Male", "Female"],
                name: "Gender (All/Male/Female): ",
                element: "genderFilter"
            }
        }
    },

    encoding: {
        x: {
            field: "Caffeine_mg",
            type: "quantitative",
            title: "Caffeine Intake (mg)"
        },
        y: {
            field: "Sleep_Hours",
            type: "quantitative",
            title: "Sleep Duration (hours)"
        },
        color: {
            field: "Gender",
            type: "nominal",
            scale: {
                domain: ["Male", "Female"],
                range: ["#362822", "#F0C376"]
            },
            legend: { title: "Gender" }
        },
        opacity: {
            condition: { selection: "genderSel", value: 1 },
            value: 0.2
        },
        tooltip: [
            { field: "Gender", type: "nominal" },
            { field: "Country", type: "nominal" },
            { field: "Caffeine_mg", type: "quantitative" },
            { field: "Sleep_Hours", type: "quantitative" }
        ]
    }
};

// Render function to make chart responsive
function renderSleepHourChart() {
    const container = document.getElementById("sleepHours");

    if (!container) return;

    // Get current container width
    const containerWidth = container.clientWidth || 600;

    // Set an aspect ratio for height
    const aspectRatio = 0.6; // height = 60% of width
    let chartHeight = containerWidth * aspectRatio;

    // Optional: clamp min/max height
    chartHeight = Math.max(250, Math.min(chartHeight, 600));

    // Create a new spec with dynamic width and height
    const spec = {
        ...baseSpec,
        width: containerWidth,
        height: chartHeight
    };

    // Embed chart
    vegaEmbed("#sleepHours", spec, { actions: false });
}

// Initial render
renderSleepHourChart();


const sleepQualityStackedBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: { url: "caffeine.csv" },

    mark: "bar",

    encoding: {
        x: {
            field: "Caffeine_mg",
            type: "quantitative",
            bin: { step: 100 },
            title: "Caffeine intake (mg, binned)"
        },

        y: {
            aggregate: "count",
            stack: "normalize",
            axis: {
                format: "0%",
                title: "Proportion"
            }
        },

        color: {
            field: "Sleep_Quality",
            type: "nominal",
            title: "Sleep quality",
            sort: ["Poor", "Fair", "Good", "Excellent"],
            scale: {
                range: ["#614033", "#F0DEBB", "#BE9757", "#D26946"]
            }
        },

        tooltip: [
            {
                field: "Caffeine_mg",
                type: "quantitative",
                bin: { step: 100 },
                title: "Caffeine intake (mg, bin)"
            },
            { field: "Sleep_Quality", type: "nominal", title: "Sleep quality" },
            {
                aggregate: "count",
                field: "Sleep_Quality",
                title: "Number of people"
            }
        ]
    }
};


// Render function for responsive width and height (stacked bar)
function renderSleepQualityStackedChart() {
    const container = document.getElementById("sleepQuality");
    if (!container) return;

    let containerWidth = container.clientWidth || 900;

    const maxWidth = 900;
    const chartWidth = Math.min(containerWidth, maxWidth);


    const aspectRatio = 650 / 800;
    let chartHeight = chartWidth * aspectRatio;

    const minHeight = 300;
    const maxHeight = 700;
    chartHeight = Math.max(minHeight, Math.min(chartHeight, maxHeight));

    const sleepQualityStackedSpec = {
        ...sleepQualityStackedBaseSpec,
        width: chartWidth,
        height: chartHeight
    };

    vegaEmbed("#sleepQuality", sleepQualityStackedSpec, { actions: false });
}


const sleepQualityBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { url: "caffeine.csv" },


    transform: [
        {
            calculate: "random() * 0.8 - 0.4",
            as: "jitter"
        }
    ],

    layer: [
        // layer 1: scatter plot 
        {
            mark: {
                type: "point",
                filled: true,
                opacity: 0.4,
                size: 28
            },
            encoding: {
                x: {
                    field: "Caffeine_mg",
                    type: "quantitative",
                    title: "Caffeine intake (mg)"
                },
                y: {
                    field: "Sleep_Quality",
                    type: "nominal",
                    title: "Sleep quality",
                    sort: ["Poor", "Fair", "Good", "Excellent"]
                },

                yOffset: {
                    field: "jitter",
                    type: "quantitative"
                },
                color: {
                    field: "Sleep_Quality",
                    type: "nominal",
                    sort: ["Poor", "Fair", "Good", "Excellent"],
                    scale: {
                        range: ["#614033", "#F0DEBB", "#BE9757", "#D26946"]
                    },
                    legend: { title: "Sleep quality" }
                }
            }
        },

        // Layer 2: Avg
        {
            mark: {
                type: "image",
                width: 32,
                height: 32
            },
            encoding: {
                x: {
                    field: "Caffeine_mg",
                    type: "quantitative",
                    aggregate: "mean"
                },
                y: {
                    field: "Sleep_Quality",
                    type: "nominal",
                    sort: ["Poor", "Fair", "Good", "Excellent"]
                },
                url: {
                    value: "src/coffeeBean_You.svg"
                },
                tooltip: [
                    { field: "Sleep_Quality", title: "Sleep quality" },
                    {
                        field: "Caffeine_mg",
                        aggregate: "mean",
                        title: "Average caffeine (mg)",
                        format: ".1f"
                    }
                ]
            }
        }


    ]
};


// Render function for responsive width and height
function renderSleepQualityChart() {
    const container = document.getElementById("sleepQualityScatter");
    if (!container) return;


    let containerWidth = container.clientWidth || 900;

    const maxWidth = 900;
    const chartWidth = Math.min(containerWidth, maxWidth);


    const aspectRatio = 700 / 900;
    let chartHeight = chartWidth * aspectRatio;

    const minHeight = 300;
    const maxHeight = 700;
    chartHeight = Math.max(minHeight, Math.min(chartHeight, maxHeight));

    // make coffee bean responsive
    const beanSize = Math.max(16, Math.min(40, chartWidth / 25));


    const sleepQualityJitterSpec = JSON.parse(JSON.stringify(sleepQualityBaseSpec));


    sleepQualityJitterSpec.width = chartWidth;
    sleepQualityJitterSpec.height = chartHeight;

    if (Array.isArray(sleepQualityJitterSpec.layer)) {
        sleepQualityJitterSpec.layer.forEach(layer => {
            if (layer.mark && layer.mark.type === "image") {
                layer.mark.width = beanSize;
                layer.mark.height = beanSize;
            }
        });
    }

    vegaEmbed("#sleepQualityScatter", sleepQualityJitterSpec, { actions: false });
}


// Initial render
renderSleepQualityChart();
renderSleepQualityStackedChart();


const coffeeByAgeSpec = {
    data: { url: "caffeine.csv" },

    mark: {
        type: "line",
        point: true
    },

    width: 800,
    height: 650,

    encoding: {
        x: {
            field: "Age",
            type: "quantitative",
            bin: { maxbins: 8 },
            title: "Age",
            axis: {
                labelAngle: 0
            }
        },

        y: {
            aggregate: "mean",
            field: "Coffee_Intake",
            type: "quantitative",
            title: "Average coffee intake (cups/day)",
            scale: { domain: [1, 3.5] },
            axis: {
                tickCount: 6,
                format: ".1f"
            }
        },

        color: {
            field: "Gender",
            type: "nominal",
            title: "Gender"
        },

        tooltip: [
            {
                field: "Age",
                type: "quantitative",
                bin: { maxbins: 5 },
                title: "Age group"
            },
            { field: "Gender", type: "nominal" },
            {
                aggregate: "mean",
                field: "Coffee_Intake",
                title: "Avg cups per day",
                format: ".2f"
            },
            {
                aggregate: "count",
                field: "Coffee_Intake",
                title: "Sample size"
            }
        ]
    }
};

vegaEmbed("#coffeeByAge", coffeeByAgeSpec);



const stressCoffeeBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: { url: "caffeine.csv" },

    layer: [
        // Layer 1: boxplot
        {
            mark: {
                type: "boxplot",
                size: 60
            },
            encoding: {
                x: {
                    field: "Stress_Level",
                    type: "nominal",
                    sort: ["Low", "Medium", "High"],
                    title: "Stress level",
                    axis: { labelAngle: 0 }
                },
                y: {
                    field: "Coffee_Intake",
                    type: "quantitative",
                    title: "Coffee intake (cups/day)"
                },
                color: {
                    field: "Stress_Level",
                    type: "nominal",
                    scale: {
                        range: ["#F0C376", "#183348", "#7A2E21"]
                    },
                    legend: { title: "Stress level" }
                }
            }
        },

        // Layer 2: jittered points
        {
            mark: {
                type: "point",
                filled: true,
                opacity: 0.4,
                size: 20
            },
            encoding: {
                x: {
                    field: "Stress_Level",
                    type: "nominal",
                    sort: ["Low", "Medium", "High"],
                    title: "Stress level",
                    axis: { labelAngle: 0 },
                    scale: {
                        bandPaddingInner: 0.1
                    }
                },
                y: {
                    field: "Coffee_Intake",
                    type: "quantitative"
                },
                color: {
                    field: "Stress_Level",
                    type: "nominal",
                    scale: {
                        range: ["#F0C376", "#183348", "#7A2E21"]
                    },
                    legend: null
                },
                tooltip: [
                    { field: "Stress_Level", type: "nominal", title: "Stress level" },
                    { field: "Coffee_Intake", type: "quantitative", format: ".1f", title: "Coffee intake (cups/day)" },
                    { field: "Age", type: "quantitative" },
                    { field: "Gender", type: "nominal" }
                ]
            }
        }
    ]
};
function renderStressCoffeeChart() {
    const container = document.getElementById("stressCoffee");
    if (!container) return;

    let containerWidth = container.clientWidth || 900;
    const maxWidth = 900;
    const chartWidth = Math.min(containerWidth, maxWidth);

    const aspectRatio = 650 / 800;
    let chartHeight = chartWidth * aspectRatio;

    const minHeight = 300;
    const maxHeight = 700;
    chartHeight = Math.max(minHeight, Math.min(chartHeight, maxHeight));

    const stressCoffeeSpec = JSON.parse(JSON.stringify(stressCoffeeBaseSpec));
    stressCoffeeSpec.width = chartWidth;
    stressCoffeeSpec.height = chartHeight;

    vegaEmbed("#stressCoffee", stressCoffeeSpec, { actions: false });
}
renderStressCoffeeChart();

// Coffee, Activity & Age
const coffeeActivityByAgeSummaryBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: { url: "caffeine.csv" },

    transform: [
        {
            calculate:
                "datum.Age < 25 ? '18–24' : datum.Age < 35 ? '25–34' : datum.Age < 45 ? '35–44' : '45+'",
            as: "Age_Group"
        },
        // Only keep Male and Female
        {
            filter: "datum.Gender == 'Male' || datum.Gender == 'Female'"
        }
    ],

    facet: {
        field: "Age_Group",
        type: "nominal",
        title: "Age group",
        sort: ["18–24", "25–34", "35–44", "45+"]
    },

    spec: {
        mark: {
            type: "line",
            point: true
        },

        encoding: {
            x: {
                field: "Coffee_Intake",
                type: "quantitative",
                bin: { maxbins: 5 },
                title: "Coffee intake (cups/day, binned)"
            },

            y: {
                aggregate: "mean",
                field: "Physical_Activity_Hours",
                type: "quantitative",
                title: "Avg activity hours",
                format: ".1f"
            },

            color: {
                field: "Gender",
                type: "nominal",
                title: "Gender",
                scale: {
                    domain: ["Male", "Female"],
                    range: ["#362822", "#F0C376"]
                }
            },

            tooltip: [
                { field: "Age_Group", type: "nominal", title: "Age group" },
                {
                    field: "Coffee_Intake",
                    type: "quantitative",
                    bin: { maxbins: 5 },
                    title: "Coffee intake (binned)"
                },
                { field: "Gender", type: "nominal" },
                {
                    aggregate: "mean",
                    field: "Physical_Activity_Hours",
                    title: "Avg activity hours",
                    format: ".2f"
                },
                {
                    aggregate: "count",
                    field: "Physical_Activity_Hours",
                    title: "Sample size"
                }
            ]
        }
    }
};


function renderCoffeeActivityByAgeSummary() {
    const container = document.getElementById("coffeeActivityByAgeSummary");
    if (!container) return;

    let containerWidth = container.clientWidth || 800;
    const maxWidth = 900;
    const totalWidth = Math.min(containerWidth, maxWidth);

    const facetColumns = 2;
    const gap = 24;
    const perFacetWidth = (totalWidth - gap) / facetColumns;


    const baseAspect = 280 / 320;
    let perFacetHeight = perFacetWidth * baseAspect;

    const minHeight = 140;
    const maxHeight = 320;
    perFacetHeight = Math.max(minHeight, Math.min(perFacetHeight, maxHeight));


    const spec = JSON.parse(JSON.stringify(coffeeActivityByAgeSummaryBaseSpec));


    spec.columns = facetColumns;


    spec.spec.width = perFacetWidth;
    spec.spec.height = perFacetHeight;

    vegaEmbed("#coffeeActivityByAgeSummary", spec, { actions: false });
}


renderCoffeeActivityByAgeSummary();


// Base spec without fixed width/height
const coffeeReasonsBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: {
        values: [
            { Reason: "Enjoys the Taste", Percent: 83.1 },
            { Reason: "Increases Energy", Percent: 67.1 },
            { Reason: "Increases Productivity", Percent: 42.7 },
            { Reason: "Healthy", Percent: 28.5 },
            { Reason: "Suppresses Appetite", Percent: 20.2 },
            { Reason: "Others", Percent: 10.0 },
            { Reason: "None of the Above", Percent: 1.6 }
        ]
    },

    transform: [
        {
            // Create label text like "83.1%"
            calculate: "datum.Percent + '%'",
            as: "Percent_Label"
        }
    ],

    // width and height will be added dynamically in renderCoffeeReasonsChart

    layer: [
        {
            mark: {
                type: "bar",
                cornerRadius: 3
            },
            encoding: {
                y: {
                    field: "Reason",
                    type: "nominal",
                    sort: "-x",
                    title: null,
                    axis: {
                        labelFontSize: 14,
                        labelColor: "#4A2B18"
                    }
                },
                x: {
                    field: "Percent",
                    type: "quantitative",
                    title: null,
                    axis: {
                        grid: false,
                        ticks: false,
                        labels: false
                    }
                },
                color: {
                    value: "#F0C376"
                },
                tooltip: [
                    { field: "Reason", title: "Reason" },
                    { field: "Percent", title: "Percent", format: ".1f" }
                ]
            }
        },
        {
            mark: {
                type: "text",
                align: "left",
                baseline: "middle",
                dx: 5,
                fontSize: 12,
                color: "#362822"
            },
            encoding: {
                y: {
                    field: "Reason",
                    type: "nominal",
                    sort: "-x",
                    axis: {
                        labelFontSize: 13,
                        labelColor: "#4A2B18",
                        labelPadding: 15
                    }
                },
                x: {
                    field: "Percent",
                    type: "quantitative"
                },
                text: {
                    field: "Percent_Label",
                    type: "nominal"
                }
            }
        }
    ],

    config: {
        view: { stroke: null },
        axis: {
            domain: false,
            grid: false,
            ticks: false
        }
    }
};

// Render function for responsive bar chart
function renderCoffeeReasonsChart() {
    const container = document.getElementById("chart_coffee_reasons");
    if (!container) return;

    // Get current container width
    let containerWidth = container.clientWidth || 800;

    // Limit max width similar to original 800px for readability
    const maxWidth = 800;
    const chartWidth = Math.min(containerWidth, maxWidth);

    // Original design: width = 800, height.step = 48
    const baseStep = 48;
    const scaleFactor = chartWidth / 800;

    // Scale bar step with width, and clamp to a reasonable range
    let barStep = baseStep * scaleFactor;
    const minStep = 32;
    const maxStep = 64;
    barStep = Math.max(minStep, Math.min(barStep, maxStep));

    // Build final spec with dynamic width and height.step
    const coffeeReasonsSpec = {
        ...coffeeReasonsBaseSpec,
        width: chartWidth,
        height: { step: barStep }
    };

    vegaEmbed("#chart_coffee_reasons", coffeeReasonsSpec, { actions: false });
}

// Initial render
renderCoffeeReasonsChart();

//Data from our survey
// Age Distribution Pie Chart (Using Project Theme Colors)
const ageDistributionSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: {
        url: "Responses.csv"
    },

    // Create a clean field name without quotes for age
    transform: [
        {
            // Copy the original column "What's your age?" into a new field "AgeGroup"
            calculate: "datum['What\\'s your age?']",
            as: "AgeGroup"
        }
    ],

    width: 320,
    height: 320,

    mark: {
        type: "arc",
        innerRadius: 70,     // donut style
        outerRadius: 140
    },

    encoding: {
        // Use count of records for angle (no field needed for count)
        theta: {
            aggregate: "count",
            type: "quantitative"
        },

        // Color by the new clean field "AgeGroup"
        color: {
            field: "AgeGroup",
            type: "nominal",
            title: "Age Group",
            scale: {
                range: [
                    "#362822", // espresso
                    "#F0C376", // coffee
                    "#F7ECD7", // cream
                    "#1A3447",  // dark blue
                    "#D26946"
                ]
            }
        },

        // Tooltip for interaction
        tooltip: [
            { field: "AgeGroup", title: "Age Group" },
            { aggregate: "count", title: "Count" }
        ]
    }
};

// Render the visualization
vegaEmbed("#ageChart", ageDistributionSpec);

// Gender Distribution Pie Chart (Using Project Theme Colors)
const genderDistributionSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: {
        url: "Responses.csv"
    },

    // Create a clean field name for gender
    transform: [
        {
            calculate: "datum['What\\'s your gender?']",
            as: "Gender"
        }
    ],

    width: 320,
    height: 320,

    mark: {
        type: "arc",
        innerRadius: 70,   // donut style
        outerRadius: 140
    },

    encoding: {
        // Use count of records for angle
        theta: {
            aggregate: "count",
            type: "quantitative"
        },

        // Color by gender, matching project palette
        color: {
            field: "Gender",
            type: "nominal",
            title: "Gender",
            scale: {
                range: [
                    "#362822", // espresso
                    "#F0C376", // coffee
                    "#F7ECD7"  // cream (for other / prefer not to say)
                ]
            }
        },

        tooltip: [
            { field: "Gender", title: "Gender" },
            { aggregate: "count", title: "Count" }
        ]
    }
};

// Render gender chart
vegaEmbed("#genderChart", genderDistributionSpec);

// Gender vs Coffee Intake (Boxplot)
const genderCoffeeSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: {
        url: "Responses.csv"
    },

    transform: [
        {
            // Create a clean gender field
            calculate: "datum['What\\'s your gender?']",
            as: "Gender"
        },
        {
            // Convert coffee cups to a numeric field
            calculate: "toNumber(datum['How many cups of coffee do you normally drink in a day? (1 cup ~ 300mL)'])",
            as: "CoffeeCups"
        },
        {
            // Keep only valid numeric values
            filter: "isValid(datum.CoffeeCups) && !isNaN(datum.CoffeeCups)"
        }
    ],

    width: 420,
    height: 320,

    mark: {
        type: "boxplot",
        extent: "min-max",   // show full range
        size: 50
    },

    encoding: {
        // Gender on the x-axis
        x: {
            field: "Gender",
            type: "nominal",
            title: "Gender",
            axis: { labelAngle: 0 }
        },

        // Coffee cups on the y-axis
        y: {
            field: "CoffeeCups",
            type: "quantitative",
            title: "Daily coffee intake (cups)"
        },

        // Color by gender using project palette
        color: {
            field: "Gender",
            type: "nominal",
            scale: {
                range: [
                    "#362822", // espresso
                    "#F0C376", // coffee
                    "#F7ECD7"  // cream
                ]
            },
            legend: { title: "Gender" }
        },

        tooltip: [
            { field: "Gender", title: "Gender" },
            { field: "CoffeeCups", title: "Coffee intake (cups)" }
        ]
    }
};

// Render Gender vs Coffee chart
vegaEmbed("#genderCoffeeChart", genderCoffeeSpec);

// Weekday Activities Frequency Bar Chart

const weekdayActivitySpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: {
        values: [
            { Activity: "Doom scroll your phone", Count: 29 },
            { Activity: "Full-time Work", Count: 25 },
            { Activity: "Hang out with friends", Count: 23 },
            { Activity: "Make Dinner", Count: 23 },
            { Activity: "School Project", Count: 22 },
            { Activity: "Make Breakfest", Count: 20 },
            { Activity: "School Lecture", Count: 20 },
            { Activity: "Exercise", Count: 20 },
            { Activity: "Make Lunch", Count: 19 },
            { Activity: "Part-time Work", Count: 11 },
            { Activity: "Walk the Dog", Count: 5 }
        ]
    },

    transform: [
        {
            calculate: "datum.Count + ''",
            as: "Count_Label"
        }
    ],

    width: 520,
    height: { step: 32 },

    layer: [
        {
            mark: {
                type: "bar",
                cornerRadius: 3,
                size: 25
            },
            encoding: {
                y: {
                    field: "Activity",
                    type: "nominal",
                    sort: "-x",
                    title: null,
                    axis: {
                        labelFontSize: 14,
                        labelColor: "#4A2B18",
                        labelPadding: 20
                    }
                },
                x: {
                    field: "Count",
                    type: "quantitative",
                    title: null,
                    axis: {
                        grid: false,
                        ticks: false,
                        labels: false
                    }
                },
                color: {
                    value: "#362822" // espresso color
                },
                tooltip: [
                    { field: "Activity", title: "Activity" },
                    { field: "Count", title: "Responses" }
                ]
            }
        },

        // Text label to the right of the bar
        {
            mark: {
                type: "text",
                align: "left",
                baseline: "middle",
                dx: 5,
                fontSize: 13,
                color: "#362822"
            },
            encoding: {
                y: {
                    field: "Activity",
                    type: "nominal",
                    sort: "-x"
                },
                x: {
                    field: "Count",
                    type: "quantitative"
                },
                text: {
                    field: "Count_Label"
                }
            }
        }
    ],

    config: {
        view: { stroke: null },
        axis: {
            domain: false,
            grid: false,
            ticks: false
        }
    }
};

// Render activity chart
vegaEmbed("#weekdayActivityChart", weekdayActivitySpec, { actions: false });


// Mental State Change After Coffee (Frequency Bar Chart)
const mentalChangeSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: {
        url: "Responses.csv"
    },

    transform: [
        {
            // Convert mental state rating to a numeric field
            calculate: "toNumber(datum['After drinking coffee, do you feel a change in your mental state?'])",
            as: "MentalChange"
        },
        {
            // Keep only valid numeric values
            filter: "isValid(datum.MentalChange) && !isNaN(datum.MentalChange)"
        },
        {
            // Turn number into string label like "1", "2", ..., for cleaner axis
            calculate: "toString(datum.MentalChange)",
            as: "MentalChangeLabel"
        }
    ],

    width: 520,
    height: { step: 40 },

    layer: [
        {
            mark: {
                type: "bar",
                cornerRadius: 3,
                size: 22  // thinner bar → more space between bars
            },
            encoding: {
                // Vertical: rating levels 1–5
                y: {
                    field: "MentalChangeLabel",
                    type: "nominal",
                    sort: "ascending",
                    title: "Perceived mental change (1–5)",
                    axis: {
                        labelFontSize: 14,
                        labelColor: "#4A2B18",
                        labelPadding: 12
                    }
                },
                // Horizontal: count of responses for each rating
                x: {
                    aggregate: "count",
                    field: "MentalChange",
                    type: "quantitative",
                    title: null,
                    axis: {
                        grid: false,
                        ticks: false,
                        labels: false
                    }
                },
                color: {
                    value: "#362822" // espresso color
                },
                tooltip: [
                    { field: "MentalChangeLabel", title: "Rating (1–5)" },
                    { aggregate: "count", field: "MentalChange", title: "Responses" }
                ]
            }
        },
        {
            // Text label on the right of each bar showing the count
            mark: {
                type: "text",
                align: "left",
                baseline: "middle",
                dx: 8,
                fontSize: 13,
                color: "#362822"
            },
            encoding: {
                y: {
                    field: "MentalChangeLabel",
                    type: "nominal",
                    sort: "ascending"
                },
                x: {
                    aggregate: "count",
                    field: "MentalChange",
                    type: "quantitative"
                },
                text: {
                    aggregate: "count",
                    field: "MentalChange"
                }
            }
        }
    ],

    config: {
        view: { stroke: null },
        axis: {
            domain: false,
            grid: false,
            ticks: false
        }
    }
};

// Render mental state change chart
vegaEmbed("#mentalChangeChart", mentalChangeSpec, { actions: false });


// Coffee Cups vs Sleep Duration (Mean + Error Bars)
const coffeeSleepMeanSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: { url: "Responses.csv" },

    transform: [
        // Parse coffee cups
        {
            calculate: "toNumber(datum['How many cups of coffee do you normally drink in a day? (1 cup ~ 300mL)'])",
            as: "CoffeeCups"
        },
        {
            filter: "isValid(datum.CoffeeCups) && !isNaN(datum.CoffeeCups)"
        },

        // Parse sleep time
        {
            calculate: "toDate('2000-01-01 ' + datum['What time do you typically sleep on a weekday?'])",
            as: "SleepTime"
        },
        // Parse wake time
        {
            calculate: "toDate('2000-01-02 ' + datum['What time do you typically wake up on a weekday?'])",
            as: "WakeTime"
        },
        // Compute sleep duration in hours
        {
            calculate:
                "((hours(datum.WakeTime) * 60 + minutes(datum.WakeTime)) - " +
                "(hours(datum.SleepTime) * 60 + minutes(datum.SleepTime))) / 60",
            as: "SleepDurationHours"
        },
        {
            filter: "datum.SleepDurationHours > 0 && datum.SleepDurationHours < 16"
        }
    ],

    width: 520,
    height: 320,

    layer: [
        // Error bars (mean ± stdev)
        {
            mark: { type: "errorbar", ticks: true, rule: true, color: "#362822" },
            encoding: {
                x: {
                    field: "CoffeeCups",
                    type: "ordinal",
                    sort: "ascending",
                    title: "Daily coffee intake (cups)",
                    axis: { labelFontSize: 13, labelColor: "#4A2B18" }
                },
                y: {
                    field: "SleepDurationHours",
                    type: "quantitative",
                    aggregate: "mean",
                    title: "Sleep duration (hours)",
                    axis: { labelFontSize: 13, labelColor: "#4A2B18" }
                }
            }
        },

        // Mean points
        {
            mark: {
                type: "point",
                filled: true,
                size: 90,
                color: "#362822"
            },
            encoding: {
                x: { field: "CoffeeCups", type: "ordinal", sort: "ascending" },
                y: { field: "SleepDurationHours", type: "quantitative", aggregate: "mean" },
                tooltip: [
                    { field: "CoffeeCups", title: "Cups" },
                    { field: "SleepDurationHours", aggregate: "mean", title: "Avg Sleep (hrs)", format: ".2f" }
                ]
            }
        }
    ],

    config: {
        view: { stroke: null },
        axis: { grid: false, ticks: false, domain: false }
    }
};

vegaEmbed("#coffeeSleepMeanChart", coffeeSleepMeanSpec, { actions: false });





let resizeTimer;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        renderCoffeeReasonsChart();
        renderSleepHourChart();
        renderSleepQualityChart();
        renderSleepQualityStackedChart();
        renderCoffeeActivityByAgeSummary();
        renderStressCoffeeChart();
    }, 200);
});


// const sleepQualityHeatmapSpec = {
//     data: { url: "caffeine.csv" },

//     width: 800,
//     height: { step: 100 },

//     transform: [

//         {
//             bin: { step: 100 },
//             field: "Caffeine_mg",
//             as: ["Caffeine_bin", "Caffeine_bin_end"]
//         },


//         {
//             aggregate: [
//                 { op: "count", as: "count" }
//             ],
//             groupby: ["Caffeine_bin", "Caffeine_bin_end", "Sleep_Quality"]
//         },


//         {
//             joinaggregate: [
//                 { op: "sum", field: "count", as: "bin_total" }
//             ],
//             groupby: ["Caffeine_bin", "Caffeine_bin_end"]
//         },


//         {
//             calculate: "datum.count / datum.bin_total",
//             as: "Proportion"
//         }
//     ],

//     mark: "rect",

//     encoding: {

//         x: {
//             field: "Caffeine_bin",
//             type: "quantitative",
//             bin: { binned: true, step: 100 },
//             title: "Caffeine intake (mg, binned)"
//         },
//         x2: { field: "Caffeine_bin_end" },


//         y: {
//             field: "Sleep_Quality",
//             type: "nominal",
//             sort: ["Poor", "Fair", "Good", "Excellent"],
//             title: "Sleep quality"
//         },


//         color: {
//             field: "Proportion",
//             type: "quantitative",
//             title: "Proportion",
//             axis: { format: "0%" },
//             scale: {
//                 range: ["#F8EBD8", "#BF9B77", "#362822"]
//             }
//         },

//         tooltip: [
//             { field: "Caffeine_bin", title: "Caffeine mg (bin start)" },
//             { field: "Caffeine_bin_end", title: "Caffeine mg (bin end)" },
//             { field: "Sleep_Quality", title: "Sleep quality" },
//             {
//                 field: "Proportion",
//                 title: "Proportion",
//                 format: "0.0%"
//             },
//             { field: "count", title: "Number of people" }
//         ]
//     },

//     config: {
//         view: { stroke: null },
//         axis: {
//             labelFont: "Helvetica",
//             titleFont: "Helvetica"
//         }
//     }
// };

// vegaEmbed("#sleepQualityHeatmap", sleepQualityHeatmapSpec);
