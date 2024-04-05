import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function useAxios(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the JWT from the '_auth' cookie
        const jwt = Cookies.get('_auth');

        // Set up the Axios headers with the JWT as a bearer token
        const headers = {
          Authorization: `Bearer ${jwt}`,
        };

        // Make the GET request with the headers
        const response = await axios.get(url, { headers });
        setData(response.data);
        /* TODO: remove */
        //console.log(response.data)
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    //wait for the cookies to be loaded the first time you load the page
    setTimeout(() => {
      
      fetchData();
    }, 500);

  }, [url]);

  return { data, loading, error, setData};
}

export default useAxios;
