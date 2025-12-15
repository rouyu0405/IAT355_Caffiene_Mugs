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

//Ajust font size
const GLOBAL_VEGA_CONFIG = {
    axis: {
        labelFontSize: 16,
        titleFontSize: 18
    },
    legend: {
        labelFontSize: 16,
        titleFontSize: 18
    },
    header: {
        labelFontSize: 16,
        titleFontSize: 18
    },
    title: {
        fontSize: 18
    }
};

function withGlobalConfig(spec) {
    return {
        ...spec,
        config: {
            ...GLOBAL_VEGA_CONFIG,
            ...(spec.config || {})
        }
    };
}


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
    vegaEmbed("#sleepHours", withGlobalConfig(spec), { actions: false });
}

// Initial render
renderSleepHourChart();


const sleepQualityStackedBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: { url: "caffeine.csv" },

    mark: "bar",

    autosize: {
        type: "fit",
        contains: "padding"
    },

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
                range: ["#362822", "#FAEDD6", "#F0C376", "#1A3447"]
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

    vegaEmbed("#sleepQuality", withGlobalConfig(sleepQualityStackedSpec), { actions: false }).then(result => {
        if (result.view && container.firstChild) {
            container.firstChild.style.display = 'block';
            container.firstChild.style.margin = '0 auto';
        }
    });
}


const sleepQualityBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { url: "caffeine.csv" },

    autosize: {
        type: "fit",
        contains: "padding"
    },

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
                        range: ["#362822", "#1A3447", "#F0C376", "#6E6E6E"]
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
                    value: "src/bean-clicked.svg"
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

    vegaEmbed("#sleepQualityScatter", withGlobalConfig(sleepQualityJitterSpec), { actions: false }).then(result => {
        if (result.view && container.firstChild) {
            container.firstChild.style.display = 'block';
            container.firstChild.style.margin = '0 auto';
        }
    });
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

    autosize: {
        type: "fit",
        contains: "padding"
    },

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

function renderCoffeeByAgeChart() {
    const container = document.getElementById("coffeeByAge");
    if (!container) return;

    const containerWidth = container.clientWidth || 700;

    const aspectRatio = 0.8; 
    let chartHeight = containerWidth * aspectRatio;

    chartHeight = Math.max(300, Math.min(chartHeight, 700));

    const spec = {
        ...coffeeByAgeSpec,
        width: containerWidth,
        height: chartHeight
    };

    vegaEmbed("#coffeeByAge", withGlobalConfig(spec), { actions: false }).then(result => {
        if (result.view && container.firstChild) {
            container.firstChild.style.display = 'block';
            container.firstChild.style.margin = '0 auto';
        }
    });
}
renderCoffeeByAgeChart();


const stressCoffeeBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: { url: "caffeine.csv" },

    autosize: {
        type: "fit",
        contains: "padding"
    },

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
                        range: ["#F0C376", "#183348", "#6E6E6E"]
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
                        range: ["#F0C376", "#183348", "#6E6E6E"]
                    },
                    legend: null
                },
                tooltip: [
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

    vegaEmbed("#stressCoffee", withGlobalConfig(stressCoffeeSpec), { actions: false }).then(result => {
        if (result.view && container.firstChild) {
            container.firstChild.style.display = 'block';
            container.firstChild.style.margin = '0 auto';
        }
    });
}
renderStressCoffeeChart();

// Coffee, Activity & Age
const coffeeActivityByAgeSummaryBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: { url: "caffeine.csv" },

    autosize: {
        type: "fit",
        contains: "padding"
    },

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

    const breakpoint = 700;
    const facetColumns = containerWidth < breakpoint ? 1 : 2;

    const maxWidth = 900;
    const totalWidth = Math.min(containerWidth, maxWidth);

    const gap = facetColumns > 1 ? 24 : 0;
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

    vegaEmbed("#coffeeActivityByAgeSummary", withGlobalConfig(spec), { actions: false }).then(result => {
        if (result.view && container.firstChild) {
            container.firstChild.style.display = 'block';
            container.firstChild.style.margin = '0 auto';
        }
    });
}

renderCoffeeActivityByAgeSummary();


// Base spec without fixed width/height
const coffeeReasonsBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    padding: { top: 10, right: 50, bottom: 10, left: 10 },
    autosize: { type: "fit-x", contains: "padding" },

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
            calculate: "datum.Percent + '%'",
            as: "Percent_Label"
        }
    ],

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
                        labelFont: "Calibri",
                        labelFontSize: 24,
                        labelFontWeight: "bold",
                        labelColor: "#4A2B18",
                        labelPadding: 15,
                        labelLimit: 0
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
                font: "Calibri",
                fontSize: 24,
                fontWeight: "bold",
                color: "#362822"
            },
            encoding: {
                y: {
                    field: "Reason",
                    type: "nominal",
                    sort: "-x"
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

    const containerWidth = container.clientWidth || 800;
    const maxWidth = 800;
    const chartWidth = Math.min(containerWidth, maxWidth);

    const baseStep = 48;
    const scaleFactor = chartWidth / 800;

    let barStep = baseStep * scaleFactor;
    const minStep = 32;
    const maxStep = 64;
    barStep = Math.max(minStep, Math.min(barStep, maxStep));

    const coffeeReasonsSpec = {
        ...coffeeReasonsBaseSpec,
        width: chartWidth,
        height: { step: barStep }
    };

    vegaEmbed("#chart_coffee_reasons", withGlobalConfig(coffeeReasonsSpec), { actions: false });
}



// Initial render
renderCoffeeReasonsChart();


//Data from our survey
// Base spec for Age distribution donut chart
const ageDistributionBaseSpec = {
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

    // width / height / radius will be added in renderAgeChart

    mark: {
        type: "arc"
        // innerRadius and outerRadius will be set dynamically
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
                    "#1A3447", // dark blue
                    "#6E6E6E"
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

// Render age donut chart (responsive)
function renderAgeChart() {
    const container = document.getElementById("ageChart");
    if (!container) return;

    // Get container width
    let containerWidth = container.clientWidth || 320;

    // Limit max width similar to original
    const maxWidth = 320;
    const chartWidth = Math.min(containerWidth, maxWidth);

    // Make the chart square
    const chartHeight = chartWidth;

    // Base radii used in the original design
    const baseWidth = 320;
    const baseOuterRadius = 140;
    const baseInnerRadius = 70;

    // Scale radii with width
    const scaleFactor = chartWidth / baseWidth;
    let outerRadius = baseOuterRadius * scaleFactor;
    let innerRadius = baseInnerRadius * scaleFactor;

    // Ensure the donut fits inside the chart (a little padding)
    const maxRadius = chartWidth / 2 - 5;
    if (outerRadius > maxRadius) {
        outerRadius = maxRadius;
        innerRadius = outerRadius / 2;
    }

    // Build final spec with dynamic size and radii
    const ageDistributionSpec = {
        ...ageDistributionBaseSpec,
        width: chartWidth,
        height: chartHeight,
        mark: {
            ...ageDistributionBaseSpec.mark,
            innerRadius,
            outerRadius
        }
    };

    vegaEmbed("#ageChart", withGlobalConfig(ageDistributionSpec), { actions: false });
}

// Initial render
renderAgeChart();


// Gender Distribution Pie Chart (Using Project Theme Colors)
const genderDistributionBaseSpec = {
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

    // width / height / radius will be added in renderGenderChart

    mark: {
        type: "arc"
        // innerRadius and outerRadius will be set dynamically
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

// Render gender donut chart (responsive)
function renderGenderChart() {
    const container = document.getElementById("genderChart");
    if (!container) return;

    // Get container width
    let containerWidth = container.clientWidth || 320;

    // Limit max width similar to original
    const maxWidth = 320;
    const chartWidth = Math.min(containerWidth, maxWidth);

    // Make the chart square
    const chartHeight = chartWidth;

    // Base radii used in the original design
    const baseWidth = 320;
    const baseOuterRadius = 140;
    const baseInnerRadius = 70;

    // Scale radii with width
    const scaleFactor = chartWidth / baseWidth;
    let outerRadius = baseOuterRadius * scaleFactor;
    let innerRadius = baseInnerRadius * scaleFactor;

    // Ensure the donut fits inside the chart (a little padding)
    const maxRadius = chartWidth / 2 - 5;
    if (outerRadius > maxRadius) {
        outerRadius = maxRadius;
        innerRadius = outerRadius / 2;
    }

    // Build final spec with dynamic size and radii
    const genderDistributionSpec = {
        ...genderDistributionBaseSpec,
        width: chartWidth,
        height: chartHeight,
        mark: {
            ...genderDistributionBaseSpec.mark,
            innerRadius,
            outerRadius
        }
    };

    vegaEmbed("#genderChart", withGlobalConfig(genderDistributionSpec), { actions: false });
}

// Initial render
renderGenderChart();


// Gender vs Coffee Intake (Boxplot)
const genderCoffeeBaseSpec = {
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

    // width and height will be added dynamically in renderGenderCoffeeChart

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
            axis: {
                labelAngle: 0
            }
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

// Render Gender vs Coffee chart (responsive)
// Render Gender vs Coffee chart (responsive, width and height scale together)
function renderGenderCoffeeChart() {
    const container = document.getElementById("genderCoffeeChart");
    if (!container) return;

    // Get current container width
    let containerWidth = container.clientWidth || 420;

    // Allow the chart to grow up to maxWidth
    const maxWidth = 600;
    const chartWidth = Math.min(containerWidth, maxWidth);

    // Base design size
    const baseWidth = 420;
    const baseHeight = 320;

    // Keep the same aspect ratio as the base chart
    const scaleFactor = chartWidth / baseWidth;
    const chartHeight = baseHeight * scaleFactor;   // height scales with width

    // Build final spec with dynamic width and height
    const genderCoffeeSpec = {
        ...genderCoffeeBaseSpec,
        width: chartWidth,
        height: chartHeight
    };

    vegaEmbed("#genderCoffeeChart", withGlobalConfig(genderCoffeeSpec), { actions: false });
}

// Initial render
renderGenderCoffeeChart();


// Weekday Activities Frequency Bar Chart
const weekdayActivityBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    padding: { top: 10, right: 50, bottom: 10, left: 10 },
    autosize: { type: "fit-x", contains: "padding" },

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
        { calculate: "datum.Count + ''", as: "Count_Label" }
    ],

    layer: [
        {
            mark: {
                type: "bar",
                cornerRadius: 3
            },
            encoding: {
                y: {
                    field: "Activity",
                    type: "nominal",
                    sort: "-x",
                    title: null,
                    axis: {
                        labelFont: "Calibri",
                        labelFontSize: 24,
                        labelFontWeight: "bold",
                        labelColor: "#4A2B18",
                        labelPadding: 15,
                        labelLimit: 0
                    }
                },
                x: {
                    field: "Count",
                    type: "quantitative",
                    title: null,
                    scale: {
                        domain: [0, 40]
                    },
                    axis: {
                        grid: false,
                        ticks: false,
                        labels: false
                    }
                },
                color: { value: "#F0C376" },

                tooltip: [
                    { field: "Activity", title: "Activity" },
                    { field: "Count", title: "Count" }
                ]
            }
        },

        {
            mark: {
                type: "text",
                align: "left",
                baseline: "middle",
                dx: 5,
                font: "Calibri",
                fontSize: 24,
                fontWeight: "bold",
                color: "#362822"
            },
            encoding: {
                y: { field: "Activity", type: "nominal", sort: "-x" },
                x: { field: "Count", type: "quantitative" },
                text: { field: "Count_Label" },

                tooltip: [
                    { field: "Activity", title: "Activity" },
                    { field: "Count", title: "Count" }
                ]
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




// Render function for responsive weekday activity chart
function renderWeekdayActivityChart() {
    const container = document.getElementById("weekdayActivityChart");
    if (!container) return;

    const containerWidth = container.clientWidth || 800;
    const maxWidth = 800;
    const chartWidth = Math.min(containerWidth, maxWidth);

    const baseWidth = 800;
    const baseStep = 40;
    const scaleFactor = chartWidth / baseWidth;


    let barStep = baseStep * scaleFactor;
    const minStep = 28;
    const maxStep = 60;
    barStep = Math.max(minStep, Math.min(barStep, maxStep));


    const axisFontSize = Math.max(12, Math.min(24, 24 * scaleFactor));
    const labelFontSize = Math.max(12, Math.min(24, 16 * scaleFactor));

    const weekdayActivitySpec = {
        ...weekdayActivityBaseSpec,
        width: chartWidth,
        height: { step: barStep }
    };


    weekdayActivitySpec.layer[0].encoding.y.axis = {
        ...weekdayActivitySpec.layer[0].encoding.y.axis,
        labelFontSize: axisFontSize
    };


    weekdayActivitySpec.layer[1].mark = {
        ...weekdayActivitySpec.layer[1].mark,
        fontSize: labelFontSize
    };

    vegaEmbed("#weekdayActivityChart", withGlobalConfig(weekdayActivitySpec), { actions: false });
}


// Initial render
renderWeekdayActivityChart();



// Base spec for Coffee vs Sleep Duration (mean ± stdev)
const coffeeSleepMeanBaseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    data: { url: "Responses.csv" },

    transform: [
        // Parse coffee cups into a numeric field
        {
            calculate: "toNumber(datum['How many cups of coffee do you normally drink in a day? (1 cup ~ 300mL)'])",
            as: "CoffeeCups"
        },
        {
            // Keep only valid numeric values for coffee cups
            filter: "isValid(datum.CoffeeCups) && !isNaN(datum.CoffeeCups)"
        },

        // Parse sleep time as a date on a fixed day
        {
            calculate: "toDate('2000-01-01 ' + datum['What time do you typically sleep on a weekday?'])",
            as: "SleepTime"
        },
        // Parse wake time as a date on the next day
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
            // Filter out unrealistic sleep durations
            filter: "datum.SleepDurationHours > 0 && datum.SleepDurationHours < 16"
        }
    ],

    // width and height will be added dynamically in renderCoffeeSleepMeanChart

    layer: [
        // Error bars (mean ± stdev)
        {
            mark: {
                type: "errorbar",
                ticks: true,
                rule: true,
                color: "#362822"
                // with ordinal x, the horizontal ticks will span the band width
            },
            encoding: {
                x: {
                    field: "CoffeeCups",
                    type: "ordinal",
                    sort: "ascending",
                    title: "Daily coffee intake (cups)",
                    axis: {
                        labelAngle: 0,            // keep labels horizontal
                        labelFontSize: 24,
                        labelColor: "#4A2B18"
                    },
                    scale: {
                        paddingInner: 0.3,        // control spacing between categories
                        paddingOuter: 0.2
                    }
                },
                y: {
                    field: "SleepDurationHours",
                    type: "quantitative",
                    aggregate: "mean",
                    title: "Sleep duration (hours)",
                    axis: { labelFontSize: 24, labelColor: "#4A2B18" }
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
                x: {
                    field: "CoffeeCups",
                    type: "ordinal",
                    sort: "ascending",
                    axis: { labelAngle: 0 }
                },
                y: {
                    field: "SleepDurationHours",
                    type: "quantitative",
                    aggregate: "mean"
                },
                tooltip: [
                    { field: "CoffeeCups", title: "Cups" },
                    {
                        field: "SleepDurationHours",
                        aggregate: "mean",
                        title: "Avg Sleep (hrs)",
                        format: ".2f"
                    }
                ]
            }
        }
    ],

    config: {
        view: { stroke: null },
        axis: {
            grid: false,
            ticks: false,
            domain: false
        }
    }
};

// Render function for responsive Coffee vs Sleep chart (proportional width/height)
function renderCoffeeSleepMeanChart() {
    const container = document.getElementById("coffeeSleepMeanChart");
    if (!container) return;

    // Get current container width
    let containerWidth = container.clientWidth || 520;

    // Allow chart to grow up to a larger maximum width if needed
    const maxWidth = 600;
    const chartWidth = Math.min(containerWidth, maxWidth);

    // Base design dimensions
    const baseWidth = 520;
    const baseHeight = 320;

    // Keep consistent aspect ratio by scaling height with width
    const scaleFactor = chartWidth / baseWidth;
    const chartHeight = baseHeight * scaleFactor;

    // Build final spec with dynamic width and height
    const coffeeSleepMeanSpec = {
        ...coffeeSleepMeanBaseSpec,
        width: chartWidth,
        height: chartHeight
    };

    vegaEmbed("#coffeeSleepMeanChart", withGlobalConfig(coffeeSleepMeanSpec), { actions: false });
}


// Initial render
renderCoffeeSleepMeanChart();


//testimony scroll
class TestimonialCarousel {
    constructor(options) {
        // Elements
        this.beanRow = document.getElementById(options.beanRow);
        this.textEl = document.getElementById(options.text);
        this.infoEl = document.getElementById(options.info);
        this.section = document.getElementById(options.section);

        // Data
        this.testimonials = [];
        this.currentIndex = 0;
        this.isAnimating = false; // Lock interactions

        // Layout
        this.windowSize = 5; // Keep odd number for center
        this.middleIndex = Math.floor(this.windowSize / 2);
        this.beanWidth = 56;

        // Timer
        this.autoRotateTimer = null;
        this.rotateDelay = options.rotateDelay || 8000;
        this.sectionVisible = false;

        // Assets
        this.beanDefault = options.beanDefault;
        this.beanActive = options.beanActive;

        // Init
        this.setupObserver();
        this.loadCSV("Testimony.csv");
    }

    wrap(i) {
        return (i + this.testimonials.length) % this.testimonials.length;
    }

    renderBeans() {
        if (!this.testimonials.length) return;

        this.beanRow.innerHTML = "";
        const frag = document.createDocumentFragment();

        for (let i = 0; i < this.windowSize; i++) {
            const realIndex = this.wrap(this.currentIndex - this.middleIndex + i);

            const bean = document.createElement("img");
            const isCenter = i === this.middleIndex;

            bean.src = isCenter ? this.beanActive : this.beanDefault;
            bean.className = `bean-base ${isCenter ? "bean-center" : ""}`;

            // Interaction
            bean.onclick = () => {
                if (this.isAnimating || i === this.middleIndex) return;

                // if i < middle, we go left (prev). if i > middle, we go right (next)
                const direction = i < this.middleIndex ? "left" : "right";

                const steps = Math.abs(i - this.middleIndex);

                this.transitionTo(direction, steps);
            };

            frag.appendChild(bean);
        }
        this.beanRow.appendChild(frag);
    }

    transitionTo(direction, steps = 1) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.stopAutoRotate();

        this.textEl.classList.remove("show");
        this.infoEl.classList.remove("show");


        const offset = direction === "right" ? -this.beanWidth : this.beanWidth;

        // Apply transform to container
        this.beanRow.style.transform = `translateX(${offset * steps}px)`;

        // Update classes immediately for visual "Scaling" during the slide
        const beans = Array.from(this.beanRow.children);
        // Remove center from current
        beans[this.middleIndex].classList.remove("bean-center");
        beans[this.middleIndex].src = this.beanDefault;

        // Add center to the target
        const nextVisualIndex = direction === "right" ? this.middleIndex + 1 : this.middleIndex - 1;
        if (beans[nextVisualIndex]) {
            beans[nextVisualIndex].classList.add("bean-center");
            beans[nextVisualIndex].src = this.beanActive;
        }

        setTimeout(() => {
            // Update logical index
            if (direction === "right") {
                this.currentIndex = this.wrap(this.currentIndex + steps);
            } else {
                this.currentIndex = this.wrap(this.currentIndex - steps);
            }

            this.beanRow.style.transition = "none";
            this.beanRow.style.transform = "translateX(0)";

            // Re-render DOM in new order
            this.renderBeans();
            this.updateTestimonyText(); // Change text content

            // Force browser repaint
            void this.beanRow.offsetWidth;

            // Re-enable transitions for next time
            this.beanRow.style.transition = "";

            this.textEl.classList.add("show");
            this.infoEl.classList.add("show");

            this.isAnimating = false;
            this.startAutoRotate();

        }, 400); // Sync with CSS transition duration
    }

    updateTestimonyText() {
        const t = this.testimonials[this.currentIndex];
        this.textEl.textContent = t.text;
        this.infoEl.textContent = `${t.gender}, ${t.age}`;
    }

    startAutoRotate() {
        this.stopAutoRotate();
        this.autoRotateTimer = setInterval(() => {
            if (this.sectionVisible && !this.isAnimating) {
                this.transitionTo("right");
            }
        }, this.rotateDelay);
    }

    stopAutoRotate() {
        if (this.autoRotateTimer) clearInterval(this.autoRotateTimer);
    }

    setupObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                this.sectionVisible = entry.isIntersecting;
                if (this.sectionVisible) {
                    // Initial animation on scroll into view
                    this.textEl.classList.add("show");
                    this.infoEl.classList.add("show");
                    this.startAutoRotate();
                } else {
                    this.stopAutoRotate();
                }
            });
        }, { threshold: 0.4 });
        observer.observe(this.section);
    }

    loadCSV(path) {
        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text();
            })
            .then(text => {
                const lines = text.trim().split("\n");
                const headers = lines.shift().split(",").map(h => h.trim());

                this.testimonials = lines.map(line => {
                    const cols = line.split(",");
                    const obj = {};

                    headers.forEach((header, index) => {
                        obj[header] = (cols[index] || "").trim();
                    });

                    return obj;
                });

                this.renderBeans();
                this.updateTestimonyText();
                this.startAutoRotate();
            })
            .catch(error => {
                console.error("Error loading CSV:", error);
                // Fallback content in case CSV fails
                this.textEl.textContent = "Could not load testimonials.";
            });
    }
}

// Initialize
const carousel = new TestimonialCarousel({
    beanRow: "beanRow",
    text: "testimonyText",
    info: "testimonyInfo",
    section: "testimonialSection",
    csv: "Testimony.csv",
    beanDefault: "src/bean-default.svg",
    beanActive: "src/bean-clicked.svg",
    rotateDelay: 5000
});



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
        renderWeekdayActivityChart();
        renderCoffeeSleepMeanChart();
        renderGenderCoffeeChart();
        renderGenderChart();
        renderAgeChart();
    }, 200);
});