import Cookies from 'js-cookie';

export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch('/api/token/refresh', {
      method: 'POST',
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

  const refreshToken = Cookies.get('refresh-token');

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
