import { useEffect, useState, useContext } from "react";

const fs = require('fs');
if (typeof window !== 'undefined') {
  const BrowserFS = require('browserfs');
  BrowserFS.install(window);

  BrowserFS.FileSystem.InMemory.Create((err: Error | null, inMemoryFS: any) => {
    if (err) throw err;
    fs.mkdirSync('/sandbox');
    fs.mount('/sandbox', inMemoryFS);
    fs.writeFileSync('/sandbox/test.txt', 'Hello, BrowserFS!');
  });

  fs.readFile('/sandbox/test.txt', 'utf8', (err: Error | null, data: string) => {
    if (err) throw err;
    console.log(data); // Output: Hello, BrowserFS!
  });
}

let GIFFYAPIKEY = process.env.APIKEY; // Corrected ImportMeta usage
const useFetch = ({ keyword }: { keyword: string }) => {
  const [gifUrl, setGifUrl] = useState("");

  const fetchGifs = async () => {
    try {
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIFFYAPIKEY}&q=${keyword.split(" ").join("")}&limit=1`);
      const { data } = await response.json();

      setGifUrl(data[0]?.images?.downsized_medium.url);
    } catch (error) {
      setGifUrl("https://metro.co.uk/wp-content/uploads/2015/05/pokemon_crying.gif?quality=90&strip=all&zoom=1&resize=500%2C284");
    }
  };

  useEffect(() => {
    if (keyword) fetchGifs();
  }, [keyword]);

  return gifUrl;
};

export default useFetch;
