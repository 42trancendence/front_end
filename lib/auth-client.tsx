import Cookies from 'js-cookie';

export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch('/auth/refresh', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
