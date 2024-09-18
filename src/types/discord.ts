import type {
    ApplicationCommandOption,
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    UserContextMenuCommandInteraction,
    StringSelectMenuInteraction,
} from "discord.js";
import { Locales } from "../locales";

export type Command =
    | {
          role: "CHAT_INPUT";
          run: (
              interaction: ChatInputCommandInteraction,
              serverLocale: Locales,
              userLocale: Locales,
          ) => unknown;
          name: string;
          name_localizations?: Record<string, string>;
          description: string;
          description_localizations?: Record<string, string>;
          options?: ApplicationCommandOption[];
          default_member_permissions?: bigint;
          nsfw?: boolean;
          integration_types?: number[];
          contexts?: number[];
      }
    | {
          role: "MESSAGE_CONTEXT_MENU";
          run: (
              interaction: MessageContextMenuCommandInteraction,
              serverLocale: Locales,
              userLocale: Locales,
          ) => unknown;
          name: string;
          name_localizations?: Record<string, string>;
          description_localizations?: Record<string, string>;
          options?: ApplicationCommandOption[];
          default_member_permissions?: bigint;
          nsfw?: boolean;
          integration_types?: number[];
          contexts?: number[];
      }
    | {
          role: "USER_CONTEXT_MENU";
          run: (
              interaction: UserContextMenuCommandInteraction,
              serverLocale: Locales,
              userLocale: Locales,
          ) => unknown;
          name: string;
          name_localizations?: Record<string, string>;
          description_localizations?: Record<string, string>;
          options?: ApplicationCommandOption[];
          default_member_permissions?: bigint;
          nsfw?: boolean;
          integration_types?: number[];
          contexts?: number[];
      }
    | {
          role: "SELECT_MENU";
          custom_id: string;
          run: (
              interaction: StringSelectMenuInteraction,
              serverLocale: Locales,
              userLocale: Locales,
          ) => unknown;
      }
    | {
          role: "BUTTON";
          custom_id: string;
          run: (
              interaction: ButtonInteraction,
              serverLocale: Locales,
              userLocale: Locales,
          ) => unknown;
      }
    | {
          role: "MODAL_SUBMIT";
          custom_id: string;
          run: (
              interaction: ModalSubmitInteraction,
              serverLocale: Locales,
              userLocale: Locales,
          ) => unknown;
      }
    | {
          role: "AUTOCOMPLETE";
          name: `${string}-autocomplete`;
          run: (
              interaction: AutocompleteInteraction,
              serverLocale: Locales,
              userLocale: Locales,
          ) => unknown;
      };

export type CommandNoRun = Omit<Command, "run">;
