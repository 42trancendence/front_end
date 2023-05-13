export async function refreshAccessToken() {
  try {
    const response = await fetch('http://localhost:3000/auth/refresh', {
      method: 'GET',
      headers: {
        "Content-Type": 'application/json',
      },
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // Update the access token in the localstorage
    const newAccessToken = data.accessToken;
    localStorage.setItem('token', newAccessToken);
    return newAccessToken;
  } catch (error) {
    return null;
  }
}



export async function handleRefresh() {

  let accessToken = await refreshAccessToken();

  if (!accessToken) {
    localStorage.removeItem("token");
    return null;
  }

  // Retry fetching data with the new access token
  return accessToken;
}
