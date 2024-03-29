import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is reqired",
  }),
  password: z.string().min(1, "Enter the password"),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, "Username length must be more than 6 symbols"),
  email: z.string().email({
    message: "Email is reqired",
  }),
  password: z.string().min(6, "Password length must be more than 6 symbols"),
});

export const SearchSchema = z.object({
  search: z.string(),
});

export const AddProjectSchema = z.object({
  title: z.string().min(1, "Enter the project name"),
});

export const AddTagsSchema = z.object({
  title: z.string().min(1, "The title is required"),
  color: z.string(),
  textColor: z.string(),
});
