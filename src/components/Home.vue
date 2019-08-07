<template>
  <div class="home">
    <div class="text-wrapper">
      <div class="section-1">
        Welcome to InfoQuake+'s Cryptocurrency Tracker! You can use the search box on the left, to filter through the list of cryptocurrency by simply typing in the cryptocurrency name and clicking on search. If you wish to see the whole list again, click on clear.
      </div><br />
      <div class="section-2">
        The default currency for all cryptocurrency is USD. You can change it to any other currency you wish or even to another cryptocurrency by simply selecting the desired currency from the dropdown box on the right.
      </div>
    </div><br />
    <div class="input-wrapper">
      <div class="input-text">
        <input placeholder="Search..." v-model="search"/>
        <button v-on:click="setSearchTerm">Search</button>
        <button v-on:click="clearSearchTerm">Clear</button>
      </div>
      <div class="select-currency">
        <label for="currency">Currency:&nbsp;&nbsp;</label>
        <select name="currency" v-model="selectedCurrency" placeholder="currency" @change="changeSelected">
          <option v-for="data in exchangeCurrency" :key="data.currency">{{ data.currency }}</option>
        </select>
      </div>
    </div><br />
     <vue-good-table
      :columns="columns"
      :rows="rows"
      @on-page-change="onPageChange"
      :pagination-options="{
        enabled: true,
        mode: 'pages',
        perPage: 100,
        position: 'bottom',
        dropdownAllowAll: false,
        setCurrentPage: currentPage,
        nextLabel: 'next',
        prevLabel: 'prev',
        rowsPerPageLabel: 'Rows per page',
        ofLabel: 'of',
        pageLabel: 'page', // for 'pages' mode
        allLabel: 'All',
      }"
      :search-options="{
        enabled: true,
        externalQuery: searchTerm
      }"
      ></vue-good-table>

  </div>
</template>

<script>
import { format, subDays } from 'date-fns';
import { cryptoCurrency } from '../../cryptoConfig.js';
export default {
  name: 'Home',
  data() {
    return {
      search: "",
      searchTerm: "",
      columns: [
        {
          label: "#",
          field: "rank"
        },
        {
          label: "Name",
          field: "name",
        },
        {
          label: "Market Cap",
          field: "marketCap"
        },
        {
          label: "Price",
          field: "price"
        },
        {
          label: "Change",
          field: "change"
        },
        {
          label: "ATH",
          field: "ath"
        },
        {
          label: "Volume",
          field: "volume"
        },
        {
          label: "Circulating Supply",
          field: "circulatingSupply"
        }
      ],
      rows: [],
      currentPage: 1,
      exchangeCurrency: [],
      selectedCurrency: 'USD'
    };
  },
  methods: {
    // Setting to selected page so that refreshing data don't affect page no.
    onPageChange(params) {
      this.currentPage = params.currentPage;
    },
    // Fetching all Currency details with currency being whatever set in the selected variable
    fetchCurrenciesTicker(currency = this.selectedCurrency) {
      fetch('https://api.nomics.com/v1/currencies/ticker?key=d78e44c03972e93fe4b01dc9f0001a41&interval=1d&quote-currency=' + currency)
        .then(response => response.json())
        .then(data => {
          this.rows = [];
          data.forEach((value) => {
            this.rows.push({
              rank: value.rank,
              name: ( cryptoCurrency[value.currency] ? cryptoCurrency[value.currency] : '-') + " (" + value.currency + ")",
              marketCap: this.formatAmount('en-US', currency, value.market_cap),
              price: this.formatAmount('en-US', currency, value.price),
              change: this.numberWithCommas((value['1d'].price_change_pct * 100).toFixed(2)) + '%',
              ath: value.high === null ? '-' : this.numberWithCommas(Math.round(100 - (((value.high - value.price) / value.high) * 100))) + '%' ,
              volume: this.formatAmount('en-US', currency, value['1d'].volume),
              circulatingSupply: this.numberWithCommas(value.circulating_supply)
            })
          })
        })
        .catch(err => console.log(err));
    },
    // format amount to the currency being seleected
    formatAmount(language, currency, number) {
      return new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(number);
    },
    // fetching all the currencies to populate the dropdown list
    fetchExchangeRage() {
      const startDate = encodeURIComponent(format(subDays(new Date(), 1), 'YYYY-MM-DD[T]HH:mm:ss[Z]'));
      const endDate = encodeURIComponent(format(new Date(), 'YYYY-MM-DD[T]HH:mm:ss[Z]'));
      fetch("https://api.nomics.com/v1/exchange-rates?key=d78e44c03972e93fe4b01dc9f0001a41&start=" + startDate + "&end=" + endDate)
        .then(response => response.json())
        .then(data => {
          this.exchangeCurrency = data;
        })
    },
    // format any number with commas
    numberWithCommas(x) {
      if (x === null) return 'N/A';
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    // Used to change currency to the user selected one and fetching data accordingly
    changeSelectedCurrency() {
      this.fetchCurrenciesTicker();
    },
    // Set search term to filter through the table
    setSearchTerm() {
      this.searchTerm = this.search;
    },
    // Clear search term to show all data in the table
    clearSearchTerm() {
      this.searchTerm = "";
    }
  },
  mounted() {
    this.fetchCurrenciesTicker();
    this.fetchExchangeRage();
    // Calling the function at every 10 seconds interval. If you want to increase time interval, change the value (in milliseconds)
    setInterval(() => this.fetchCurrenciesTicker(), 10000);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .input-wrapper {
    display: flex;
    justify-content: space-between;
  }
  .text-wrapper {
    text-align: left;
  }
</style>
