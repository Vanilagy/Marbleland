<template>
    <Teleport to="#modal-container">
        <div class="wrapper" :class="{ 'shown': shown }" @click="hide">
            <div class="inner" @click.stop>
                <slot />
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue';

const shown = ref(false);

const show = () => {
    shown.value = true;
    window.addEventListener('keydown', onKeyDown);
};
const hide = () => {
    shown.value = false;
    window.removeEventListener('keydown', onKeyDown);
};
defineExpose({ show, hide })

const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') hide();
};

onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
</script>

<style scoped>
.wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: grid;
    place-items: center;
    opacity: 0;
    transition: opacity 0.15s;
}
.wrapper.shown {
    opacity: 1;
    pointer-events: auto;
}

.inner {
    background: var(--background-color);
    border-radius: 10px;
    transform: scale(0.95);
    transition: transform 0.15s;
    padding: 20px;
    width: 500px;
    max-width: calc(100% - 20px);
    max-height: calc(100% - 20px);
}
.wrapper.shown > .inner {
    transform: scale(1)
}
</style>