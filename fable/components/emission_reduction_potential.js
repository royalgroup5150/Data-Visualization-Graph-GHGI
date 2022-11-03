import { useEffect, useState } from "react";
import dynamic from "next/dynamic.js";
const dataSrc = require("../consts/Data_EmissionReductionPotential.json");
const consts = require("../consts/consts");

const FC = dynamic(() => import("./fusion_chart.js"), { ssr: false });
const defaultHeight = 400;

export default function EmissionRedcutionPotentialComponent() {

    const [country, setCountry] = useState(consts.COUNTY_CHINA);
    const [mitigationOption, setMitigationOption] = useState(consts.MITIGATION_OPTION_RICE_CULTIVATION);
    const [unit, setUnit] = useState(consts.UNIT_TCH4_HA);
    const [exportData, setExportData] = useState([]);

    const [chartConfigs, setChartConfigs] = useState({
        type: "scatter",
        width: "100%",
        height: "100%",
        dataFormat: "JSON",
        containerBackgroundOpacity: "0",
        dataSource: {
            chart: {
                captionFontColor: "#ffffff",
                xAxisNameFontColor: "#ddd",
                xAxisValueFontColor: "#ddd",

                yAxisNameFontColor: "#ddd",
                yAxisValueFontColor: "#ddd",
                legendItemFontColor: "#ffffff",
                // captionFontSize: "18",

                // subCaption: "In MMbbl = One Million barrels",
                // subCaptionFontColor: "#ffffff",

                bgColor: "#000000",
                bgAlpha: "0",

                // baseFontSize: "18",
                // baseFontColor: "#ff0000",

                // defaultcenterlabelColor: "#cccccc",

                labelFontSize: "12",
                labelFontColor: "#cccccc",

                // caption: "???",
                // subcaption: "Los Angeles Topanga",
                // xaxisname: "Avg Day Temperature",
                yaxisname: consts.UNIT_TCH4_HA,
                xaxisminvalue: "23",
                xaxismaxvalue: "95",
                ynumberprefix: "",
                yaxisminvalue: "1200",
                xnumbersuffix: "",
                theme: "fusion",
                plottooltext:
                    "<b>$yDataValue</b> worth <b>$seriesNames</b> were sold,<br>when temperature was <b>$xdataValue</b>"
            },
            categories: [
                {
                    category: []
                }
            ],
            dataset: [
                {
                    seriesname: "",
                    anchorbgcolor: "",
                    data: []
                },
                {
                    seriesname: "",
                    anchorbgcolor: "",
                    data: []
                }
            ]
        }
    });

    useEffect(() => {
        generateChartData();
    }, []);

    const generateChartData = () => {
        let data = dataSrc.filter((ele) => {
            return (ele["Country"] === country && ele["Unit"] === unit && ele["MitigationOption"] === mitigationOption);
        });
        setExportData(data);
        // let data = dataSrc;
        let xLabels = new Map();
        let categoryData = [];
        let key = 1;
        data.map((item) => {
            if(item["DataSource"] === consts.DATA_SOURCE_FAO || item["DataSource"] === consts.DATA_SOURCE_IPCC) {
                if (!xLabels.has(item["DataSource"])) {
                    xLabels.set(item["DataSource"], key);
                    categoryData.push({ x: (key * 20).toString(), label: item["DataSource"] });
                }
            } else {
                if (!xLabels.has(item["System"])) {
                    xLabels.set(item["System"], key);
                    categoryData.push({ x: (key * 20).toString(), label: item["System"] });
                }
            }
            key++;
        });
        console.log(categoryData);

        let dataArrForMax = [];
        let dataArrForMin = [];
        let dataArrForMedian = [];
        let dataArrForAverage = [];

        data.map((ele) => {
            if(ele["DataSource"] === consts.DATA_SOURCE_FAO || ele["DataSource"] === consts.DATA_SOURCE_IPCC) {
                let xValue = categoryData.find((e) => {
                    return e["label"] == ele["DataSource"];
                })["x"];
                dataArrForMedian.push({ x: xValue, y: ele["Median"] });
            } else {
                let xValue = categoryData.find((e) => {
                    return e["label"] == ele["System"];
                })["x"];
                if (ele["Max"]) {
                    dataArrForMax.push({ x: xValue, y: ele["Max"] });
                }
                if (ele["Min"]) {
                    dataArrForMin.push({ x: xValue, y: ele["Min"] });
                }
                if (ele["Median"]) {
                    dataArrForMedian.push({ x: xValue, y: ele["Median"] });
                }
                if (ele["Average"]) {
                    dataArrForAverage.push({ x: xValue, y: ele["Average"] });
                }
            }
        });

        setChartConfigs({
            ...chartConfigs, dataSource: {
                ...chartConfigs.dataSource,
                categories: [{ category: categoryData }],
                dataset: [
                    { seriesname: "Max", anchorbgcolor: consts.colors[0], data: dataArrForMax },
                    { seriesname: "Min", anchorbgcolor: consts.colors[1], data: dataArrForMin },
                    { seriesname: "Median", anchorbgcolor: consts.colors[2], data: dataArrForMedian },
                    { seriesname: "Average", anchorbgcolor: consts.colors[3], data: dataArrForAverage }
                ]
            }
        });
    }

    useEffect(() => {
        generateChartData();
    }, [chartConfigs]);

    useEffect(() => {
        setChartConfigs({
            ...chartConfigs, dataSource: {
                ...chartConfigs.dataSource,
                chart: {
                    ...chartConfigs.dataSource.chart,
                    yaxisname: unit
                }

            }
        })
    }, [unit]);

    const unitChange = (e) => {
        setUnit(e.target.value);
    }

    const mitigationOptionChange = (e) => {
        setMitigationOption(e.target.value);
    }

    const countryChange = (e) => {
        setCountry(e.target.value);
    }

    

    const downloadData = () => {
        // exportToCSV();
        let fileName = new Date();
        fileName = fileName.getFullYear() + "-" + (fileName.getMonth() + 1) + "-" + fileName.getDate() + " " +
            fileName.getHours() + ":" + fileName.getMinutes() + ":" + fileName.getSeconds();
        exportToCSV(exportData, fileName);
    }

    return (
        <>
            <div className="bg-local text-center grid content-center" style={{ backgroundImage: "url(../fable_bg1.jpg)", minHeight: "600px" }}>
                {/* <div className="bg-gradient-to-r from-blue-400 via-green-500 to-yellow-300 p-12"> */}
                <div className="grid grid-cols-6 bg-gray-800 bg-opacity-40 rounded-xl p-5 m-12 items-center justify-center">
                    <div className="bg-gray-900 col-span-2 bg-opacity-20 rounded-md text-gray-200 grid text-center items-center p-3 my-3" style={{ minHeight: "400px" }}>
                        <b>Some Text Here!</b>
                    </div>
                    <div className="col-span-4">
                        <div className="flex justify-between">
                            <div className="flex">

                                <div className="flex items-center mx-2.5">
                                    {/* <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-200">Country : </label> */}
                                    <select id="countries" className="bg-gray-900 bg-opacity-20 border border-gray-200 text-gray-200 text-sm rounded-lg focus:text-gray-900 focus:border-gray-900 focus-visible:outline-none block p-2.5 ml-2.5" onChange={countryChange} value={country}>
                                        <option className="text-gray-900" value={""}>Country</option>
                                        {
                                            consts.COUNTY_LIST.map((countryItem) => (
                                                <option className="text-gray-900" value={countryItem}>{countryItem}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="flex items-center mx-2.5">
                                    {/* <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-200">Year : </label> */}
                                    <select id="mitigationOptions" className="bg-gray-900 bg-opacity-20 border border-gray-200 text-gray-200 text-sm rounded-lg focus:text-gray-900 focus:border-gray-900 focus-visible:outline-none block p-2.5 ml-2.5" onChange={mitigationOptionChange} value={mitigationOption}>
                                        <option className="text-gray-900" value={""}>Mitigation.Option</option>
                                        {
                                            consts.MITIGATION_OPTION_LIST.map((optionItem) => (
                                                <option className="text-gray-900" value={optionItem}>{optionItem}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="flex items-center mx-2.5">
                                    {/* <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-200">Data Source : </label> */}
                                    <select id="countries" className="bg-gray-900 bg-opacity-20 border border-gray-200 text-gray-200 text-sm rounded-lg focus:text-gray-900 focus:border-gray-900 focus-visible:outline-none block p-2.5 ml-2.5" onChange={unitChange} value={unit}>
                                        <option className="text-gray-900" value={""}>Unit</option>
                                        {
                                            consts.UNIT_LIST.map((unitItem) => (
                                                <option className="text-gray-900" value={unitItem}>{unitItem}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                {/* <div className="flex items-center mx-2.5">
                                    <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-200">Data Source : </label>
                                    <select id="countries" className="bg-gray-900 bg-opacity-20 border border-gray-200 text-gray-200 text-sm rounded-lg focus:text-gray-900 focus:border-gray-900 focus-visible:outline-none block p-2.5 ml-2.5" defaultValue="">
                                        <option className="text-gray-900" value={""}>AR</option>
                                        <option className="text-gray-900" value={"US"}>Option 1</option>
                                        <option className="text-gray-900" value={"CA"}>Option 2</option>
                                        <option className="text-gray-900" value={"FR"}>Option 3</option>
                                    </select>
                                </div> */}
                            </div>

                            <div className="flex items-center mx-2.5 float-right">
                                {/* <button type="button" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-sm px-5 py-2.5 ml-2.5 text-center">Download Data</button> */}
                                {/* <button type="button" class="text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300  shadow-lg shadow-pink-500/50 font-medium rounded-lg text-sm px-5 py-2.5 ml-2.5 text-center">Download Data</button> */}
                                {/* <button type="button" class="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 shadow-lg shadow-purple-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2.5">Download Data</button> */}
                                <button type="button" className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 shadow-lg shadow-green-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2.5">Download Data</button>
                            </div>
                        </div>
                        <div className="grid" style={{ minHeight: `${400}px`, minWidth: "600px" }}>
                            <FC chartConfigs={chartConfigs}></FC>
                        </div>

                    </div>

                </div>
                {/* </div> */}
            </div>
        </>
    )
}