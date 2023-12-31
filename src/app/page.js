"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [cryptos, setCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [selectedFiat, setSelectedFiat] = useState("USD");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [cryptoError, setCryptoError] = useState("");
  const fiatCurrencies = ["USD", "EUR", "INR", "GBP", "JPY"];
  const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

  
  useEffect(() => {
    fetchCryptos();
  }, []);

  const fetchCryptos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
        params: {
          vs_currency: selectedFiat, // Use selectedFiat for currency
          order: "market_cap_desc",
          per_page: 100,
          page: 1,
        },
      });
      setCryptos(response.data);
      setSelectedCrypto(response.data[0]?.id);
    } catch (error) {
      console.error(error);
      setCryptoError("Failed to load cryptocurrencies.");
    } finally {
      setLoading(false);
    }
  };
  // Function to format the currency in a more readable way
  const formatCurrency = (amount, currencyCode) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  };
  const handleConvert = async () => {
    if (!selectedCrypto || !amount || isNaN(amount) || amount < 1) {
      toast.error(
        "Please select a cryptocurrency and enter a valid amount (minimum 1)"
      );
      return;
    }

    try {
      const sourcePriceResponse = await axios.get(
        `${COINGECKO_API_URL}/simple/price`,
        {
          params: {
            ids: selectedCrypto,
            vs_currencies: selectedFiat,
          },
        }
      );
      const responseData = sourcePriceResponse.data;
      const cryptocurrency = Object.keys(responseData)[0];
      const currency = Object.keys(responseData[cryptocurrency])[0];
      const price = responseData[cryptocurrency][currency];
      setConvertedAmount(price * amount);
      setCurrencyCode(selectedFiat.toUpperCase());
      toast.success("Conversion successful");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Conversion failed!");
    }
  };

  return (
    <div>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6">Crypto Converter</Typography>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="md"
        style={{ marginTop: "3rem", marginBottom: "3rem" }}>
        <ToastContainer />
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "3rem",
            }}>
            <CircularProgress />
          </div>
        ) : (
          <Paper
            elevation={3}
            style={{ padding: "2rem", borderRadius: "15px" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {cryptoError && <Alert severity="error">{cryptoError}</Alert>}
              <TextField
                select
                label="Cryptocurrency"
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                fullWidth
                variant="outlined">
                {cryptos.map((crypto) => (
                  <MenuItem key={crypto.id} value={crypto.id}>
                    {crypto.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Fiat Currency"
                value={selectedFiat}
                onChange={(e) => setSelectedFiat(e.target.value)}
                fullWidth
                variant="outlined">
                {fiatCurrencies.map((fiat) => (
                  <MenuItem key={fiat} value={fiat}>
                    {fiat}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                variant="outlined"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleConvert}
                fullWidth>
                Convert
              </Button>
              {convertedAmount && (
                <Typography variant="h6" style={{ marginTop: "20px" }}>
                  Converted Amount:{" "}
                  {formatCurrency(convertedAmount, currencyCode)}
                </Typography>
              )}
            </div>
          </Paper>
        )}
      </Container>
    </div>
  );
}
