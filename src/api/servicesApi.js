import 
import axios from 'axios';

useEffect(() => {
  axios.get(`https://api.example.com/services/${id}`)
    .then(response => setServiceData(response.data))
    .catch(error => console.error('Error fetching service data:', error));
}, [id]);
