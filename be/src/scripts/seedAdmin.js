import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import supabase from "../config/supabase.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const username = "admin";
    const plainPassword = "admin123";

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const { data: existing, error: findError } = await supabase
      .from("admin")
      .select("id, username")
      .eq("username", username)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      const { error: updateError } = await supabase
        .from("admin")
        .update({
          password: hashedPassword,
          nama_admin: "Administrator",
          role: "admin",
        })
        .eq("username", username);

      if (updateError) throw updateError;

      console.log("Admin sudah ada. Password berhasil direset.");
      console.log("Username: admin");
      console.log("Password: admin123");
      process.exit(0);
    }

    const { error: insertError } = await supabase.from("admin").insert({
      username,
      password: hashedPassword,
      nama_admin: "Administrator",
      role: "admin",
    });

    if (insertError) throw insertError;

    console.log("Admin default berhasil dibuat.");
    console.log("Username: admin");
    console.log("Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error("Seed admin gagal:", err.message);
    process.exit(1);
  }
};

seedAdmin();
