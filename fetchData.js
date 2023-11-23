// Retrieve JSON from URL
export default async function getData(url) {
  try {
    const response = await fetch(url);
    const json = await response.json();
    console.log("Retrieved json: ", json);
    return json;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
