import axios from 'axios'

const apiUrl = 'https://628e6ce6a339dfef87adf203.mockapi.io/reneeshoes';

const apiServices = {

  getProducts: async () => {
    const res = await axios.get(apiUrl + '/products');
    return res.data;
  },

  saveProduct: async (product) => {
    const res = await axios.post(apiUrl + '/products', product);
    return res.data;
  },

  updateProduct: async (product) => {
    const res = await axios.put(apiUrl +  `/products/${product.id}`, product);
    return res.data;
  },

  deleteProduct: async (productId) => {
    await axios.delete(apiUrl + `/products/${productId}`);
  },

  getUsers: async () => {
    const res = await axios.get(apiUrl + '/users');
    return res.data;
  },

  saveUser: async (user) => {
    const res = await axios.post(apiUrl + '/users', user);
    return res.data;
  },

  getOrders: async (userId) => {
    const res = await axios.get(apiUrl + `/users/${userId}/orders`);
    return res.data;
  },

  saveOrder: async (order) => {
    const res = await axios.post(apiUrl + `/users/${order.userId}/orders`, order);
    return res.data;
  },
}

export default apiServices