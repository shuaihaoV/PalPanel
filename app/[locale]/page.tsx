'use client';
import { Button } from '@/components/ui/button';
import { useFormState } from 'react-dom';
import { LoginAction } from '@/app/actions/Actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import LanguageChanger from '@/locales/LanguageChanger';


export default function Home() {
  return (
    <LoginCard />
  )
}

function LoginCard() {
  const { t } = useTranslation("login");
  const loginFormSchema = z.object({
    username: z.string(),
    password: z.string()
  })
  const [loginErrorMessage, loginDispatch] = useFormState(LoginAction, undefined);
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  })
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="flex">
            <div className="leading-10">{t("title")}</div>
            <div className='ml-auto flex space-x-4'>
              <LanguageChanger />
            </div>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form action={loginDispatch} className="space-y-2">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("usernameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("usernamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passwordLabel")}</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder={t("passwordPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginErrorMessage && <FormMessage>{loginErrorMessage}</FormMessage>}
              <Button type="submit">{t("submitButtonText")}</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='flex justify-center mt-2'>
          2024 @Shuaihao
          <a
            href="https://github.com/shuaihaoV/PalPanel"
            className="pl-2 font-medium text-primary underline underline-offset-4 top-2"
            target="_blank"
            rel="noreferrer"
          >Github</a>
        </CardFooter>
      </Card>
    </main>
  )
}
