import { select } from "@inquirer/prompts";
import * as dotenv from "dotenv";
import { startPlaceBetProcess } from "./functionalities/placeBet";
import { startShowHistoryBetsProcess } from "./functionalities/showHistoryBets";
dotenv.config();

// Main Menu
const showMenu = async () => {
  const answer = await select({
    message: "What do you want to do?",
    loop: false,
    choices: [
      {
        name: "Place a bet",
        value: "place_bet",
      },
      {
        name: "Show my previous bets",
        value: "previous_bets",
      },
      {
        name: "Quit",
        value: "quit",
      },
    ],
  });

  switch (answer) {
    case "place_bet":
      await startPlaceBetProcess();
      break;
    case "previous_bets":
      await startShowHistoryBetsProcess();
      break;
    case "quit":
      console.log("Bye!");
      process.exit(0);
    default:
      console.log("Invalid choice, please try again.");
      await showMenu();
  }
  await showMenu();
};

async function main() {
  try {
    console.log("🎲 Welcome to BetSwirl Node example! 🎲\n");
    await showMenu();
  } catch (error) {
    console.error("An error occured:", error);
    process.exit(1);
  }
}

main();
