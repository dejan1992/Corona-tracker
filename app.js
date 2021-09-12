
const submit = document.querySelector(".btn");
const country = document.getElementById("country");
const startDate = document.getElementById("start");
const endDate = document.getElementById("end");
const resultsHeading = document.getElementById("results-heading");
const results = document.querySelector(".results");
const sugestions = document.querySelector(".sugestions");

let ctx = document.getElementById('myChart');
let myChart;

country.addEventListener("click", destroy)
startDate.addEventListener("click", destroy)
endDate.addEventListener("click", destroy)
submit.addEventListener("click", destroy)


//Search countries.json and filter it
const searchCountries = async searchText => {
  const res = await fetch("countries.json");
  const countries = await res.json();


  // Get matches to current text input
  let matches = countries.filter(country => {
    const regex = new RegExp(`^${searchText}`, "gi");
    return country.name.match(regex) || country.code.match(regex)
  });
  if (searchText.length === 0) {
    matches = [];
    sugestions.innerHTML = '';
  }
  outputHtml(matches);
}
// Show results
const outputHtml = matches => {
  if (matches.length > 0) {
    const html = matches.map(match => `<p class= "sugestions-text">${match.name}</p>`).join('');
    sugestions.innerHTML = html;
  }
}

// Destroy Chart
function destroy() {
  if (myChart) {
    myChart.destroy();
  }
  resultsHeading.innerText = "";
}

//Get data
async function covid() {
  const response = await fetch(`https://api.covid19api.com/country/${country.value}/status/confirmed/live?from=${startDate.value}T00:00:00Z&to=${endDate.value}T00:00:00Z`)

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const results = await response.json();
  const data = await results;
  if (data.message == "for performance reasons, please specify a province or a date range up to a week") {
    resultsHeading.innerText = "For performance reasons please specify a date range up to a week!";
    setTimeout(() => {
      resultsHeading.innerText = "";
    }, 2000)
  } else {
    if (data.message == "Not Found") {
      resultsHeading.innerText = "Check Country Name!";
      setTimeout(() => {
        resultsHeading.innerText = "";
      }, 1500)
    } else {
      resultsHeading.innerText = `Results for ${results[0].Country}`

      let dateArr = [];
      let casesArr = [];

      // DATA ARRAY
      for (let num of data) {
        if (num.Province == '') {
          dateArr.push(num.Date.slice(5, 10));
        }

      }

      // CASES ARRAY
      for (let num of data) {
        if (num.Province == '') {
          casesArr.push(num.Cases);
        }
      }

      // Chart
      let xValues = dateArr;
      let yValues = casesArr;

      myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: xValues,
          datasets: [{
            label: 'CONFIRMED CASES',
            data: yValues,
            backgroundColor:
              'rgb(255, 0, 0)'
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
    }
  }
}

// Event Listeners
country.addEventListener("input", () => {
  searchCountries(country.value)
})

sugestions.addEventListener("click", (e) => {
  if (e.target.className === "sugestions-text") {
    country.value = e.target.innerText;
    sugestions.innerHTML = '';
  }
})

submit.addEventListener("click", (e) => {
  if (country.value === '' || endDate.value <= startDate.value) {
    resultsHeading.innerText = "Check Country and Date!"
    setTimeout(() => {
      resultsHeading.innerText = "";
    }, 1500)
  } else {
    covid();
  }
  e.preventDefault();
});