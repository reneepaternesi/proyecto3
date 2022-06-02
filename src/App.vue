<template>
  <div id="app">
    <NavBar :itemsAdded="getItemsAdded()" :user="user" @log-out="logOut" />
    <router-view
      :products="products"
      @add-to-cart="addToCart"
      :sizes="sizes"
      :isAdmin="user.isAdmin"
      :orders="orders"
      @get-orders="getOrders"
      @update-product="updateProduct"
      @add-product="addProduct"
      @delete-product="deleteProduct"
    />
    <CartModal
      :cart="cart"
      @remove-from-cart="removeFromCart"
      @create-order="createOrder"
    />
    <LoginModal
      :isLoggedIn="isLoggedIn"
      :hasAccount="hasAccount"
      @log-in="logIn"
      @create-account="createAccount"
    />
  </div>
</template>

<script>
import apiServices from "./services/services";
import NavBar from "./components/NavBar.vue";
import CartModal from "./components/cart/CartModal.vue";
import LoginModal from "./components/LoginModal.vue";

export default {
  name: "App",
  data: () => ({
    products: [],
    users: [],
    orders: [],
    sizes: [
      { talle: 35, largo: 22.8 },
      { talle: 36, largo: 23.5 },
      { talle: 37, largo: 24.2 },
      { talle: 38, largo: 24.8 },
      { talle: 39, largo: 25.5 },
      { talle: 40, largo: 26.2 },
      { talle: 41, largo: 27 },
    ],
    cart: [],
    isLoggedIn: false,
    hasAccount: true,
    user: {},
  }),
  components: { NavBar, CartModal, LoginModal },
  mounted() {
    this.getProducts();
    this.getUsers();
    this.getCart();
  },
  methods: {
    async getProducts() {
      try {
        this.products = await apiServices.getProducts();
      } catch (err) {
        console.log(err);
        this.$bvToast.toast("Error", {
          title: `No pudimos recuperar la lista de productos, vuelve a intentarlo`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
      }
    },
    async getUsers() {
      try {
        this.users = await apiServices.getUsers();
      } catch (err) {
        console.log(err);
        this.$bvToast.toast("Error", {
          title: `No pudimos recuperar la lista de usuarios, vuelve a intentarlo`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
      }
    },
    getCart() {
      this.cart = JSON.parse(localStorage.getItem("cart")) || [];
    },
    logIn(form) {
      this.user = {};
      this.isLoggedIn = false;
      this.hasAccount = false;
      this.user = this.users.find(
        (user) => user.user === form.user && user.password === form.password
      );
      if (!this.user) {
        this.hasAccount = false;
        this.$bvToast.toast("Info", {
          title: "No existe cuenta para ese usuario y contraseña. Crea una!",
          variant: "info",
          solid: true,
        });
      } else {
        this.hasAccount = true;
        this.isLoggedIn = true;
        this.$bvToast.toast("Success", {
          title: "Has ingresado a tu cuenta correctamente",
          variant: "success",
          solid: true,
        });
        if (this.$route.name !== "home") {
          this.$router.push("/");
        }
      }
    },
    async createAccount(form) {
      const userName = this.users.find((user) => user.user === form.user);

      if (userName) {
        this.$bvToast.toast("Error", {
          title: `Ya existe un usuario con ese nombre`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
        return;
      }

      try {
        this.user = await apiServices.saveUser(form);
        this.hasAccount = true;
        this.isLoggedIn = true;
        this.$bvToast.toast("Success", {
          title: "Hemos creado tu cuenta correctamente",
          variant: "success",
          solid: true,
        });
        this.getUsers();
      } catch (err) {
        console.log(err);
        this.$bvToast.toast("Error", {
          title: `No pudimos crear tu cuenta, vuelve a intentarlo`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
      }
    },
    logOut() {
      this.user = {};
      this.isLoggedIn = false;
      if (this.$route.name !== "home") {
        this.$router.push("/");
      }
    },
    addToCart(productToCart) {
      const productInCart = this.cart.find(
        (product) => product.id === productToCart.id
      );

      if (productInCart) {
        if (productInCart.quantity < productInCart.stock) {
          productInCart.quantity++;
        } else {
          this.$bvToast.toast("Error", {
            title: "Has alcanzado la cantidad máxima de producto disponible",
            variant: "danger",
            solid: true,
          });
          return;
        }
      } else {
        const newProduct = this.products.find(
          (product) => product.id === productToCart.id
        );

        this.cart.push({
          ...newProduct,
          quantity: 1,
        });
      }
      this.$bvToast.toast("Success", {
        title: "Ya agregamos el producto al carrito ✨",
        variant: "success",
        solid: true,
      });
      localStorage.setItem("cart", JSON.stringify(this.cart));
    },
    removeFromCart(productId) {
      const productInCart = this.cart.find(
        (product) => product.id === productId
      );
      if (productInCart.quantity > 1) {
        productInCart.quantity--;
      } else {
        this.cart = this.cart.filter((p) => {
          return p.id != productId;
        });
      }
    },
    getItemsAdded() {
      var totalItems = this.cart.reduce(function (res, item) {
        return res + item.quantity;
      }, 0);
      return totalItems;
    },
    async createOrder(cart) {
      const order = {
        products: cart,
        userId: this.user.id,
        date: new Date(),
        total: cart.reduce(
          (accumulator, current) =>
            accumulator + current.price * current.quantity,
          0
        ),
      };
      try {
        await apiServices.saveOrder(order);
        this.$bvToast.toast("Success", {
          title:
            "Tu orden ha sido creada correctamente. Ya estamos trabajando en ella!",
          variant: "success",
          solid: true,
        });
        this.cart = [];
        localStorage.removeItem("cart");
      } catch (err) {
        console.log(err);
        this.$bvToast.toast("Error", {
          title: `No pudimos crear tu orden, vuelve a intentarlo`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
      }
    },
    async getOrders() {
      try {
        this.orders = await apiServices.getOrders(this.user.id);
      } catch (err) {
        console.log(err);
        this.$bvToast.toast("Error", {
          title: `No pudimos recuperar tu lista de ordenes, vuelve a intentarlo`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
      }
    },
    async updateProduct(product) {
      const productUpdated = this.products.find((p) => p.id === product.id);
      const index = this.products.indexOf(productUpdated);
      try {
        this.products[index] = await apiServices.updateProduct(product);
        this.$bvToast.toast("Success", {
          title: "El producto ha sido actualizado correctamente",
          variant: "success",
          solid: true,
        });
      } catch (err) {
        console.log(err);
        this.$bvToast.toast("Error", {
          title: `No pudimos actualizar el producto, vuelve a intentarlo`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
      }
    },
    async addProduct(product) {
      try {
        const newProduct = await apiServices.saveProduct(product);
        this.products.push(newProduct);
        this.$bvToast.toast("Success", {
          title: "El producto ha sido creado correctamente",
          variant: "success",
          solid: true,
        });
      } catch (err) {
        console.log(err);
        this.$bvToast.toast("Error", {
          title: `No pudimos guardar el nuevo producto, vuelve a intentarlo`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
      }
    },
    async deleteProduct(productId) {
      try {
        await apiServices.deleteProduct(productId);
        this.products.splice(
          this.products.findIndex(function (p) {
            return p.id === productId;
          }),
          1
        );
        this.$bvToast.toast("Success", {
          title: "El producto ha sido eliminado correctamente",
          variant: "success",
          solid: true,
        });
      } catch (err) {
        console.log(err);
        this.$bvToast.toast("Error", {
          title: `No pudimos eliminar el producto, vuelve a intentarlo`,
          variant: "danger",
          solid: true,
          noAutoHide: true,
        });
      }
    },
  },
};
</script>

<style lang="less">
@import url("https://fonts.googleapis.com/css2?family=Dosis:wght@300&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Dosis:wght@300&family=Satisfy&display=swap");

#app {
  font-family: "Dosis", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.b-toaster.b-toaster-top-right {
  right: 15px;

  .b-toaster-slot.vue-portal-target {
    font-family: "Dosis", sans-serif;

    .toast {
      border: none;

      .toast-header {
        border: none;
        background-color: #6c757d;
        color: white;
        height: 56px;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.25);
        border-radius: 4px;

        .close {
          color: #bebebe;
          font-weight: 400;
          text-shadow: none;

          &:focus,
          &:active {
            border: none;
            outline: none;
          }
        }
      }
      .toast-body {
        display: none;
      }
    }

    .b-toast-danger {
      .toast-header {
        border-left: 4px solid red;

        &:before {
          content: url("../public/assets/danger.svg");
          height: 25px;
          margin-right: 13px;
        }
      }
    }

    .b-toast-success {
      .toast-header {
        border-left: 4px solid #9df4e2;

        &:before {
          content: url("../public/assets/success.svg");
          height: 25px;
          margin-right: 13px;
        }
      }
    }

    .b-toast-info {
      .toast-header {
        border-left: 4px solid #83aefb;

        &:before {
          content: url("../public/assets/info.svg");
          height: 25px;
          margin-right: 13px;
        }
      }
    }
  }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
