import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div>
          <b>Email: </b> ozdev40@gmail.com
        </div>
        <div>
          <b>Password: </b>123456
        </div>
        <br />
        <LoginForm />
      </div>
    </div>
  );
}
