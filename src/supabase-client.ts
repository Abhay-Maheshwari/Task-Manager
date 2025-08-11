import { createClient } from "@supabase/supabase-js";


export const supabase = createClient(
    "https://hmvpsukziaordgasvagj.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdnBzdWt6aWFvcmRnYXN2YWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NjUyNTcsImV4cCI6MjA3MDQ0MTI1N30.pZV1iiN43JdjHgyzCXuHG9T59vWOZ4BUxn0Sj4i5sR4"

);