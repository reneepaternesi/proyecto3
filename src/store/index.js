import Vue from "vue";
import Vuex from 'vuex';
import apiServices from "../services/services";

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,
    state: {
        users: [],
        products: [],
        orders: [],
        cart: [],
        user: {},
    },
    getters: {
        users: state => state.users,
        products: state => state.products,
        orders: state => state.orders,
        cart: state => state.cart,
        user: state => state.user,
        getItemsAdded(state) {
            var totalItems = state.cart.reduce(function (res, item) {
                return res + item.quantity;
            }, 0);
            return totalItems;
        },
        getUserByName(state, userName) {
            return  state.users.find((user) => user.user === userName);
        },
        productById: state => id => {
            return state.products.find(product => product.id == id)
        }
      },
    mutations: {
        SET_USERS(state, users) {
            state.users = users
        },
        SET_PRODUCTS(state, products) {
            state.products = products
        },
        SET_ORDERS(state, orders) {
            state.orders = orders
        },
        SET_CART(state, cart) {
            state.cart = cart
        },
        SET_USER(state, user) {
            state.user = user
        },
        UPDATE_PRODUCT(state, product) {
            const productUpdated = state.products.find((p) => p.id === product.id);
            const index = state.products.indexOf(productUpdated);
            state.products[index] = product
        },
        ADD_PRODUCT(state, newProduct) {
            state.products.push(newProduct)
        },
        DELETE_PRODUCT(state, productId) {
            state.products.splice(
                state.products.findIndex(function (p) {
                  return p.id === productId;
                }),
                1
            );
        },
        ADD_ORDER(state, newOrder) {
            state.orders.push(newOrder)
        },
        REMOVE_FROM_CART(state, productId) {
            const productInCart = state.cart.find(
                (product) => product.id === productId
            );
            if (productInCart.quantity > 1) {
                productInCart.quantity--;
              } else {
                state.cart = state.cart.filter((p) => {
                  return p.id != productId;
                });
              }
        },
        ADD_CART_QTY(state, productId) {
            const productInCart = state.cart.find(
                (product) => product.id === productId
            );
            productInCart.quantity++;
        },
        ADD_TO_CART(state, product) {
            state.cart.push(product)
        },
        ADD_USER(state, newUser) {
            state.user = newUser
        },
        LOG_OUT(state) {
            state.user = {};
        }
    },
    actions: {
        getUsers: ({ commit }) => {
            apiServices.getUsers()
              .then(users => commit('SET_USERS', users))
              .catch(err => console.log(err))
        },
        setUser: ({ commit }, user) => {
            commit('SET_USER', user)
        },
        addUser: ({ commit }, user) => {
            apiServices.saveUser(user)
                .then(newUser => commit('ADD_USER', newUser))
                .catch(err => console.log(err))
        },
        getProducts: ({ commit }) => {
            apiServices.getProducts()
              .then(products => commit('SET_PRODUCTS', products))
              .catch(err => console.log(err))
        },
        updateProduct: ({ commit }, product) => {
            apiServices.updateProduct(product)
                .then(productUpdated => commit('UPDATE_PRODUCT', productUpdated))
                .catch(err => console.log(err))
        },
        addProduct: ({ commit }, product) => {
            apiServices.saveProduct(product)
                .then(newProduct => commit('ADD_PRODUCT', newProduct))
                .catch(err => console.log(err))
        },
        deleteProduct: ({ commit }, productId) => {
            apiServices.deleteProduct(productId)
                .then(commit('DELETE_PRODUCT', productId))
                .catch(err => console.log(err))
        },
        getOrders: ({ commit }, userId) => {
            apiServices.getOrders(userId)
              .then(orders => commit('SET_ORDERS', orders))
              .catch(err => console.log(err))
        },
        addOrder: ({ commit }, order) => {
            apiServices.saveOrder(order)
                .then(newOrder => commit('ADD_ORDER', newOrder))
                .catch(err => console.log(err))
        },
        setCart: ({commit}, cart) => {
            commit('SET_CART', cart)
        },
        removeFromCart: ({ commit }, productId) => {
            commit('REMOVE_FROM_CART', productId)
        },
        addCartQty: ({ commit }, productId) => {
            commit('ADD_CART_QTY', productId)
        },
        addToCart: ({ commit }, product) => {
            commit('ADD_TO_CART', product)
        },
        logOut: ({ commit }) => {
            commit('LOG_OUT')
        }
      }
})