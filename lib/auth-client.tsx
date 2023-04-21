import { Cookies } from 'react-cookie';

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
    console.log(data);
    //localStorage.setItem('token', newAccessToken);
    return data;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}



export async function handleRefresh(retryFunction: () => Promise<any>) {

  const cookies = new Cookies();

  const refreshToken = await cookies.get('refreshToken');
  console.log(refreshToken);

  if (!refreshToken) {
    return null;
  }

  let accessToken = await refreshAccessToken();

  if (!accessToken) {
    return null;
  }

  // Retry fetching data with the new access token
  return retryFunction();
}
