import Cookies from 'react-cookie';

export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch('http://localhost:3000/auth/refresh', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const { token: newAccessToken } = await response.json();
    // Update the access token in the localstorage
    localStorage.setItem('token', newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}



export async function handleRefresh(retryFunction: () => Promise<any>) {

  const refreshToken = Cookies.get('refreshToken');
  console.log(refreshToken);

  if (!refreshToken) {
    return null;
  }

  let accessToken = await refreshAccessToken(refreshToken);

  if (!accessToken) {
    return null;
  }

  // Retry fetching data with the new access token
  return retryFunction();
}
