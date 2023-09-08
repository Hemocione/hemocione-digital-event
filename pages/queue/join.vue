<template>
  <transition name="slide-fade-down" mode="out-in" appear>
    <div class="page">
      <h1>{{ data?.name || event }}</h1>
      <el-form :model="form" class="form-wrapper">
        <el-form-item size="large">
          <el-input
            v-model="form.phone"
            :prefix-icon="ElIconPhone"
            placeholder="Telefone"
          />
        </el-form-item>
        <el-form-item size="large">
          <el-input
            v-model="form.name"
            :prefix-icon="ElIconUser"
            placeholder="Insira seu nome"
          />
        </el-form-item>
        <el-form-item size="large">
          <el-button type="primary" @click="onSubmit"
            >Entrar na fila de Doação!<el-icon class="el-icon--right"
              ><el-icon-d-arrow-right /></el-icon
          ></el-button>
        </el-form-item>
      </el-form>
    </div>
  </transition>
</template>

<script setup lang="ts">
const route = useRoute();
const query = route.query;
const { event, eventRef, leadId, uuid } = query;
const shouldRedirect = !event || !leadId || !uuid;

const initialPhone = String(eventRef).startsWith("+55")
  ? String(eventRef)
  : `+55${eventRef}`;

if (shouldRedirect) {
  await navigateTo("/queue/not-found");
}

const { data } = shouldRedirect
  ? { data: undefined }
  : useFetch(`/api/v1/event/${event}`);

const form = ref({
  phone: initialPhone,
  name: "",
});

const onSubmit = async () => {
  const { phone, name } = form.value;
  const payload = {
    phone,
    name,
    event,
    leadId,
    uuid,
  };
  const queueId = data?.queue?._id;
  await $fetch(`/api/v1/event/${event}/queue/${queueId}/participant`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("dalee");
  // await navigateTo("https://hemocione.com.br"); // estande digital url here
};
</script>

<style scoped lang="scss">
.page {
  background-color: $color-red;
  text-align: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
}

.page h1 {
  margin: 0;
}

.form-wrapper {
  background-color: $color-gray;
  padding: 1rem;
  border-radius: 1rem;
}
</style>
