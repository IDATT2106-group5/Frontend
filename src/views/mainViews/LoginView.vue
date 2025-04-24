<script setup>
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

function onSubmit(event) {
  event.preventDefault()
  const formData = new FormData(event.target)
  console.log('Email:', formData.get('email'))
  console.log('Password:', formData.get('password'))
}
</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen p-4">
    <h1 class="text-2xl font-semibold mb-6">Login</h1>
    <Form>
      <form @submit="onSubmit" class="w-full max-w-sm space-y-6">
        <!-- Email -->
        <FormField name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input name="email" type="email" placeholder="dinMailHer@hotmail.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Password -->
        <FormField name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input name="password" type="password" placeholder="passord" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full">Login</Button>
      </form>
    </Form>
  </main>
</template>
