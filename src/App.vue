<template>
  <div id="app">
    <NavBar :itemsAdded="getItemsAdded()" :user="user" @log-out="logOut" />
    <router-view
      @add-to-cart="addToCart"
      @update-product="updateProduct"
      @add-product="addProduct"
      @delete-product="deleteProduct"
    />
    <CartModal
      :cart="cart"
      @remove-from-cart="removeFromCart"
      @create-order="createOrder"
    />
    <LoginModal @create-account="createAccount" />
  </div>
</template>

<script>
import apiServices from "./services/services";
import NavBar from "./components/NavBar.vue";
import CartModal from "./components/cart/CartModal.vue";
import LoginModal from "./components/LoginModal.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "App",
  data: () => ({
    products: [],
    users: [],
    orders: [],
    cart: [],
    isLoggedIn: false,
    hasAccount: true,
  }),
  components: { NavBar, CartModal, LoginModal },
  mounted() {
    this.getUsers();
    this.getCart();
  },
  computed: {
    ...mapGetters(["user"]),
  },
  methods: {
    ...mapActions(["logIn"]),
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
