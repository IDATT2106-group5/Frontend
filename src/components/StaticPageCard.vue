<template>
    <section class="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div
        class="bg-white max-w-3xl w-full rounded-xl shadow-md p-10 sm:p-12 space-y-6"
        style="min-height: 700px;"
      >
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div class="text-[#2c3e50] flex-shrink-0">
            <slot name="icon" />
          </div>
          <h1 class="text-2xl sm:text-4xl font-bold text-[#2c3e50] break-words">
            <slot name="title" />
          </h1>
        </div>
  
        <!-- Main content -->
        <div class="text-gray-600 space-y-6 text-base leading-relaxed">
          <slot />
        </div>
  
        <!-- Optional footer -->
        <div class="pt-6">
          <slot name="footer" />
        </div>
      </div>
    </section>
  </template>
  