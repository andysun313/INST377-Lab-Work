/*
  Hook this script to index.html
  by adding `<script src="script.js">` just before your closing `</body>` tag
*/
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }
  
  function injectHTML(list) {
    console.log("fired injectHTML");
    const target = document.querySelector("#communitycenter_list");
    target.innerHTML = "";
    list.forEach((item) => {
      const str = `<li>${item.name}</li>`;
      target.innerHTML += str;
    });
  }
  
  function filterList(list, query) {
    return list.filter((item) => {
      const lowerCaseName = item.name.toLowerCase();
      const lowerCaseQuery = query.toLowerCase();
      return lowerCaseName.includes(lowerCaseQuery);
    });
  }
  
  function cutcommunitycenterList(list) {
    console.log("fired cut list");
    const range = [...Array(4).keys()];
    return (newArray = range.map((item) => {
      const index = getRandomIntInclusive(0, list.length - 1);
      return list[index];
    }));
  }
  
  function initMap() {
      //38.9072° N, 77.0369° W
    const carto = L.map("map").setView([38.98, -76.93], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(carto);
    return carto;
  }
  
  function markerPlace(array,map) {
  console.log('array for markers', array);
  
  map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });
  


    array.forEach((item) => {
        console.log('markerPlace', item);
        const {latitude, longitude, human_address } = item.address;
        L.marker([latitude, longitude]).bindPopup(human_address).addTo(map);

    })

  }
  
  function initChart(target, data, labels) {  
    const chart = new Chart(target, {
       type: 'bar',
       data: {
         labels: labels,
         datasets: [{
           label: 'Phone Number',
           data: data,
           borderWidth: 1
         }]
       },
       options: {
         scales: {
           y: {
             beginAtZero: true
           }
         }
       }
     });
     return chart;
   }

  function processChartData(data) {
    const dataForChart = data.reduce((col, item, idx) => {

        if (!col[item.phone_number]) {
            col[item.phone_number] = 1
        }
        else{
            col[item.phone_number] +=1
        }

        return col;
    }, {})

    const dataSet = Object.values(dataForChart);
    const labels = Object.keys(dataForChart);

    //console.log(dataForChart);
    return [dataSet, labels];
   }

   function updateChart(chart, newInfo) {
    const chartData = processChartData(newInfo);
    chart.data.labels = chartData[1];
    chart.data.datasets[0].data = chartData[0];
    chart.update();
}
  async function mainEvent() {
    // the async keyword means we can make API requests
    const form = document.querySelector(".main_form"); // This class name needs to be set on your form before you can listen for an event on it
    const loadDataButton = document.querySelector("#data_load");
    const clearDataButton = document.querySelector("#data_clear");
    const generateListButton = document.querySelector("#generate");
    const textField = document.querySelector("#list_selector");
    const chart = document.querySelector('#myChart');
  
    const loadAnimation = document.querySelector("#data_load_animation");
    loadAnimation.style.display = "none";
    generateListButton.classList.add("hidden");
  
    const carto = initMap();
  
    const storedData = localStorage.getItem("storedData");
    let parsedData = JSON.parse(storedData);
    if (parsedData?.length > 0) {
      generateListButton.classList.remove("hidden");
    }
  
    let currentList = [];

    const chartData = processChartData(parsedData);
    const newChart = initChart(chart, chartData[0], chartData[1]);
  
    loadDataButton.addEventListener("click", async (submitEvent) => {
      console.log("Loading Data"); // this is substituting for a "breakpoint"
      loadAnimation.style.display = "inline-block";
  
      const results = await fetch(
        "https://data.princegeorgescountymd.gov/resource/gwq4-iu9d.json"
      );
  
      const storedList = await results.json();
      localStorage.setItem("storedData", JSON.stringify(storedList));
  
      parsedData = storedList;
  
      if (parsedData?.length > 0) {
          generateListButton.classList.remove("hidden");
        }
      
  
      loadAnimation.style.display = "none";
      // console.table(storedList);
    });
  
    generateListButton.addEventListener("click", (event) => {
      console.log("generate new list");
      currentList = cutcommunitycenterList(parsedData);
      console.log(currentList);
      injectHTML(currentList);
      markerPlace(currentList, carto);
      updateChart(newChart, currentList);
    });
  
    textField.addEventListener("input", (event) => {
      console.log("input", event.target.value);
      const newList = filterList(currentList, event.target.value);
      console.log(newList);
      injectHTML(newList);
      updateChart(newChart, newList);
    });
  
    clearDataButton.addEventListener("click", (event) => {
      console.log('clear browser data');
      localStorage.clear();
      console.log('localStorage Check', localStorage.getItem("s"))
    })
  }
  
  document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests
  