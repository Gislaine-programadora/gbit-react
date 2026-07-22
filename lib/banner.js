import figlet from "figlet";
import gradient from "gradient-string";

export default function banner() {
  console.log(
    gradient.pastel.multiline(
      figlet.textSync("GBIT REACT", {
        horizontalLayout: "default",
      })
    )
  );

  console.log(gradient.atlas("\nFull stack projects, ready to run\n"));
}
