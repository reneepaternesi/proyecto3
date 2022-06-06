<template>
  <b-form @submit.stop.prevent="onSubmit" autocomplete="off">
    <b-row>
      <b-col>
        <b-form-group
          id="input-user-group"
          label="Usuario:"
          label-for="input-user-login"
        >
          <b-form-input
            id="input-user-login"
            v-model="form.user"
            placeholder="Usuario"
            required
            v-bind:class="{
              'is-invalid':
                !validString(form.user) && formValidationState.userBlured,
              'is-valid': validString(form.user),
            }"
            v-on:blur="formValidationState.userBlured = true"
          ></b-form-input>
          <b-form-invalid-feedback>
            El usuario debe contener al menos 2 caracteres
          </b-form-invalid-feedback>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-form-group
          id="input-last-pass-group"
          label="Contraseña:"
          label-for="input-pass-name-login"
        >
          <b-form-input
            id="input-pass-name-login"
            v-model="form.password"
            placeholder="Contraseña"
            required
            type="password"
            v-bind:class="{
              'is-invalid':
                !validString(form.password) && formValidationState.passBlured,
              'is-valid': validString(form.password),
            }"
            v-on:blur="formValidationState.passBlured = true"
          ></b-form-input>
          <b-form-invalid-feedback>
            El apellido debe contener al menos 2 caracteres
          </b-form-invalid-feedback>
        </b-form-group>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "SingIn",
  async mounted() {
    await this.getUsers();
  },
  data() {
    return {
      form: {
        user: "",
        password: "",
      },
      formValidationState: {
        userBlured: false,
        passBlured: false,
      },
    };
  },
  methods: {
    ...mapActions("users", ["getUsers", "setUser"]),
    validString(text) {
      return text.length >= 2;
    },
    validateForm() {
      return (
        this.validString(this.form.user) && this.validString(this.form.password)
      );
    },
    resetForm() {
      this.form.user = "";
      this.formValidationState.userBlured = false;
      this.form.password = "";
      this.formValidationState.passBlured = false;
    },
    logIn() {
      const user = this.users.find(
        (user) =>
          user.user === this.form.user && user.password === this.form.password
      );
      if (!user) {
        this.$bvToast.toast("Info", {
          title: "No existe cuenta para ese usuario y contraseña. Crea una!",
          variant: "info",
          solid: true,
        });
      } else {
        this.setUser(user);
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
  },
};
</script>

<style></style>
