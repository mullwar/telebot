import {
  BotCommand,
  BotCommandScope,
  Chat,
  ChatAction,
  ChatId,
  ChatInviteLink,
  ChatMember,
  ChatPermissions,
  DiceEmoji,
  File,
  ForceReply,
  GameHighScore,
  InlineKeyboardMarkup,
  InlineQueryResult,
  InputMedia,
  InputMediaAudio,
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
  LabeledPrice,
  MaskPosition,
  Message,
  MethodInputFile,
  PassportElementError,
  Poll,
  PollType,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  ShippingOption,
  StickerSet,
  TelegramMessageOptional,
  TelegramUpdateNames,
  User,
  UserProfilePhotos,
  WebhookInfo
} from "../types/telegram";
import { PropertyType } from "../types/utilites";

type MethodResponse<T> = Promise<T>;

declare module "../telebot" {
    interface TeleBot {
        getMe(): MethodResponse<User>;

        logOut(): MethodResponse<true>;

        close(): MethodResponse<true>;

        sendMessage(
            chat_id: ChatId,
            text: string,
            optional?: {
                disable_web_page_preview?: boolean;
            } & TelegramMessageOptional
        ): MethodResponse<Message>;

        forwardMessage(
            chat_id: ChatId,
            from_chat_id: ChatId,
            message_id: number,
            optional?: Pick<TelegramMessageOptional, "disable_notification">
        ): MethodResponse<Message>;

        copyMessage(
            chat_id: ChatId,
            from_chat_id: ChatId,
            message_id: number,
            optional?: Pick<TelegramMessageOptional, "disable_notification">
        ): MethodResponse<Message>;

        sendPhoto(
            chat_id: ChatId,
            photo: MethodInputFile,
            optional?: {
                caption?: string;
            } & TelegramMessageOptional
        ): MethodResponse<Message>;

        sendAudio(
            chat_id: ChatId,
            audio: MethodInputFile,
            optional?: {
                duration?: number;
                performer?: string;
                title?: string;
                caption?: string;
                thumb?: MethodInputFile;
            } & TelegramMessageOptional
        ): MethodResponse<Message>;

        sendDocument(
            chat_id: ChatId,
            document: MethodInputFile,
            optional?: {
                caption?: string;
                thumb?: MethodInputFile;
                disable_content_type_detection?: boolean;
            } & TelegramMessageOptional
        ): MethodResponse<Message>;

        sendVideo(
            chat_id: ChatId,
            video: MethodInputFile,
            optional?: {
                duration?: number;
                width?: number;
                height?: number;
                thumb?: MethodInputFile;
                caption?: string;
                supports_streaming?: boolean;
            } & TelegramMessageOptional
        ): MethodResponse<Message>;

        sendAnimation(
            chat_id: ChatId,
            animation: MethodInputFile,
            optional?: {
                duration?: number;
                width?: number;
                height?: number;
                thumb?: MethodInputFile;
                caption?: string;
            } & TelegramMessageOptional
        ): MethodResponse<Message>;

        sendVoice(
            chat_id: ChatId,
            voice: MethodInputFile,
            optional?: {
                duration?: number;
                caption?: string;
            } & TelegramMessageOptional
        ): MethodResponse<Message>;

        sendVideoNote(
            chat_id: ChatId,
            video_note: MethodInputFile,
            optional?: {
                duration?: number;
                length?: number;
                thumb?: MethodInputFile;
            } & Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        sendMediaGroup(
            chat_id: ChatId,
            media: Array<InputMediaAudio | InputMediaDocument | InputMediaPhoto | InputMediaVideo>,
            optional?: Omit<TelegramMessageOptional, "parse_mode" | "reply_markup">
        ): MethodResponse<Message>;

        sendLocation(
            chat_id: ChatId,
            props: {
                latitude: number;
                longitude: number;
                live_period?: number;
                heading?: number;
                horizontal_accuracy?: number;
                proximity_alert_radius?: number;
            } & Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        editMessageLiveLocation(
            props: {
                latitude: number;
                longitude: number;
                chat_id?: ChatId;
                message_id?: number;
                inline_message_id?: number;
                heading?: number;
                proximity_alert_radius?: number;
                horizontal_accuracy?: number;
            } & Pick<TelegramMessageOptional, "reply_markup">
        ): MethodResponse<Message | true>;

        stopMessageLiveLocation(
            props: {
                chat_id?: ChatId;
                message_id?: number;
                inline_message_id?: number;
            } & Pick<TelegramMessageOptional, "reply_markup">
        ): MethodResponse<Message | true>;

        sendVenue(
            chat_id: ChatId,
            props: {
                latitude: number;
                longitude: number;
                title: string;
                address: string;
                foursquare_id?: string;
                foursquare_type?: string;
                google_place_id?: string;
                google_place_type?: string;
            } & Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        sendContact(
            chat_id: ChatId,
            phone_number: string,
            first_name: string,
            optional?: {
                last_name?: string;
                vcard?: string;
            } & Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        sendPoll(
            chat_id: ChatId,
            question: string,
            options: string[],
            optional?: {
                is_anonymous?: boolean;
                type?: PollType;
                allows_multiple_answers?: boolean;
                correct_option_id?: number;
                explanation?: string;
                explanation_parse_mode?: string;
                open_period?: number;
                close_date?: number;
                is_closed?: boolean;
            } & Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        sendDice(
            chat_id: ChatId,
            emoji: DiceEmoji,
            optional?: Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        sendChatAction(
            chat_id: ChatId,
            action: ChatAction
        ): MethodResponse<true>;

        getUserProfilePhotos(
            chat_id: ChatId,
            optional?: {
                offset?: number;
                limit?: number;
            }
        ): MethodResponse<UserProfilePhotos>;

        getFile(
            file_id: string,
        ): MethodResponse<File>;

        getFileUrl(
            file_id: string,
        ): MethodResponse<string>;

        banChatMember(
            chat_id: ChatId,
            user_id: number,
            optional?: {
                until_date?: number;
                revoke_messages?: boolean;
            }
        ): MethodResponse<true>;

        unbanChatMember(
            chat_id: ChatId,
            user_id: number,
            optional?: {
                only_if_banned?: boolean
            }
        ): MethodResponse<true>;

        restrictChatMember(
            chat_id: ChatId,
            user_id: number,
            permissions: ChatPermissions,
            optional?: {
                until_date?: number;
            }
        ): MethodResponse<true>;

        promoteChatMember(
            chat_id: ChatId,
            user_id: number,
            optional?: {
                can_change_info?: boolean;
                can_post_messages?: boolean;
                can_edit_messages?: boolean;
                can_delete_messages?: boolean;
                can_invite_users?: boolean;
                can_manage_chat?: boolean;
                can_manage_voice_chats?: boolean;
                can_restrict_members?: boolean;
                can_pin_messages?: boolean;
                can_promote_members?: boolean;
                is_anonymous?: boolean;
            }
        ): MethodResponse<true>;

        setChatAdministratorCustomTitle(
            chat_id: ChatId,
            user_id: number,
            custom_title: string
        ): MethodResponse<true>;

        banChatSenderChat(
          chat_id: ChatId,
          sender_chat_id: number
        ): MethodResponse<true>;

        unbanChatSenderChat(
          chat_id: ChatId,
          sender_chat_id: number
        ): MethodResponse<true>;

        setChatPermissions(
            chat_id: ChatId,
            permissions: ChatPermissions,
        ): MethodResponse<true>;

        exportChatInviteLink(
            chat_id: ChatId,
        ): MethodResponse<string>;

        createChatInviteLink(
            chat_id: ChatId,
            optional?: {
              name?: string;
              expire_date?: number;
              member_limit?: number;
              creates_join_request?: boolean;
            }
        ): MethodResponse<ChatInviteLink>;

        editChatInviteLink(
            chat_id: ChatId,
            invite_link: string,
            optional?: {
              name?: string;
              expire_date?: number;
              member_limit?: number;
              creates_join_request?: boolean;
            }
        ): MethodResponse<ChatInviteLink>;

        revokeChatInviteLink(
            chat_id: ChatId,
            invite_link: string
        ): MethodResponse<ChatInviteLink>;

        approveChatJoinRequest(
            chat_id: ChatId,
            user_id: string
        ): MethodResponse<true>;

        declineChatJoinRequest(
            chat_id: ChatId,
            user_id: string
        ): MethodResponse<true>;

        setChatPhoto(
            chat_id: ChatId,
            photo: MethodInputFile,
        ): MethodResponse<true>;

        deleteChatPhoto(
            chat_id: ChatId,
        ): MethodResponse<true>;

        setChatTitle(
            chat_id: ChatId,
            title: string,
        ): MethodResponse<true>;

        setChatDescription(
            chat_id: ChatId,
            optional?: {
                description?: string;
            }
        ): MethodResponse<true>;

        pinChatMessage(
            chat_id: ChatId,
            message_id: number,
            optional?: Pick<TelegramMessageOptional, "disable_notification">
        ): MethodResponse<true>;

        unpinChatMessage(
            chat_id: ChatId,
            optional?: {
                message_id?: string;
            }
        ): MethodResponse<true>;

        unpinAllChatMessages(
            chat_id: ChatId
        ): MethodResponse<true>;

        leaveChat(
            chat_id: ChatId,
        ): MethodResponse<true>;

        getChat(
            chat_id: ChatId,
        ): MethodResponse<Chat>;

        getChatAdministrators(
            chat_id: ChatId,
        ): MethodResponse<ChatMember[]>;

        getChatMemberCount(
            chat_id: ChatId,
        ): MethodResponse<number>;

        getChatMember(
            chat_id: ChatId,
            user_id: number,
        ): MethodResponse<ChatMember>;

        setChatStickerSet(
            chat_id: ChatId,
            sticker_set_name: string,
        ): MethodResponse<true>;

        deleteChatStickerSet(
            chat_id: ChatId,
        ): MethodResponse<true>;

        answerCallbackQuery(
            callback_query_id: string,
            optional?: {
                text?: string;
                show_alert?: boolean;
                url?: string;
                cache_time?: number;
            }
        ): MethodResponse<true>;

        setMyCommands(
            commands: BotCommand[],
            optional?: {
                scope?: BotCommandScope;
                language_code?: string;
            }
        ): MethodResponse<true>;

        getMyCommands(
            optional?: {
                scope?: BotCommandScope;
                language_code?: string;
            }
        ): MethodResponse<BotCommand[]>;

        deleteMyCommands(
            optional?: {
                scope?: BotCommandScope;
                language_code?: string;
            }
        ): MethodResponse<true>;

        editMessageText(
            props: {
                text: string;
                chat_id?: ChatId;
                message_id?: number;
                inline_message_id?: string;
            } & {
                disable_web_page_preview?: boolean;
            } & Omit<TelegramMessageOptional, "reply_to_message_id">
        ): MethodResponse<Message | true>;

        editMessageCaption(
            props: {
                caption?: string;
                chat_id?: ChatId;
                message_id?: number;
                inline_message_id?: string;
            } & Pick<TelegramMessageOptional, "parse_mode" | "reply_markup">
        ): MethodResponse<Message | true>;

        editMessageMedia(
            props: {
                media: InputMedia;
                chat_id?: ChatId;
                message_id?: number;
                inline_message_id?: string;
            } & Pick<TelegramMessageOptional, "reply_markup">
        ): MethodResponse<Message | true>;

        editMessageReplyMarkup(
            props: {
                chat_id?: ChatId;
                message_id?: number;
                inline_message_id?: string;
            } & Pick<TelegramMessageOptional, "reply_markup">
        ): MethodResponse<Message | true>;

        stopPoll(
            chat_id: ChatId,
            message_id: number,
            optional?: Pick<TelegramMessageOptional, "reply_markup">
        ): MethodResponse<Poll>;

        deleteMessage(
            chat_id: ChatId,
            message_id: number
        ): MethodResponse<true>;

        sendSticker(
            chat_id: ChatId,
            sticker: MethodInputFile,
            optional?: Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        getStickerSet(name: string): MethodResponse<StickerSet>;

        uploadStickerFile(user_id: number, png_sticker: MethodInputFile): MethodResponse<File>;

        createNewStickerSet(
            props: {
                user_id: number;
                name: string;
                title: string;
                emojis: string;
                png_sticker?: MethodInputFile;
                tgs_sticker?: MethodInputFile;
                webm_sticker?: MethodInputFile;
                contains_masks?: boolean;
                mask_position?: MaskPosition;
            }
        ): MethodResponse<true>;

        addStickerToSet(
            user_id: number,
            name: string,
            optional?: {
                emojis: string;
                png_sticker?: MethodInputFile;
                tgs_sticker?: MethodInputFile;
                webm_sticker?: MethodInputFile;
                mask_position?: MaskPosition;
            }
        ): MethodResponse<true>;

        setStickerPositionInSet(sticker: string, position: number): MethodResponse<true>;

        setStickerSetThumb(
            name: string,
            user_id: number,
            optional?: {
                thumb: MethodInputFile;
            }
        ): MethodResponse<true>;

        answerInlineQuery(
            inline_query_id: string,
            results: InlineQueryResult[],
            optional?: {
                cache_time?: number;
                is_personal?: boolean;
                next_offset?: string;
                switch_pm_text?: string;
                switch_pm_parameter?: string;
            }
        ): MethodResponse<true>;

        sendInvoice(
            chat_id: ChatId,
            props: {
                title: string;
                description: string;
                payload: string;
                provider_token: string;
                start_parameter?: string;
                currency: string;
                prices: LabeledPrice[];
                max_tip_amount?: number;
                suggested_tip_amounts?: number[];
                provider_data?: string;
                photo_url?: string;
                photo_size?: number;
                photo_width?: number;
                photo_height?: number;
                need_name?: boolean;
                need_phone_number?: boolean;
                need_email?: boolean;
                need_shipping_address?: boolean;
                send_phone_number_to_provider?: boolean;
                send_email_to_provider?: boolean;
                is_flexible?: boolean;
            } & Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        answerShippingQuery(
            shipping_query_id: string,
            ok: boolean,
            optional?: {
                shipping_options?: ShippingOption[];
                error_message?: string;
            }
        ): MethodResponse<true>;

        answerPreCheckoutQuery(
            pre_checkout_query_id: string,
            ok: boolean,
            optional?: {
                error_message?: string;
            }
        ): MethodResponse<true>;

        setPassportDataErrors(
            user_id: number,
            errors: PassportElementError[]
        ): MethodResponse<true>;

        sendGame(
            chat_id: ChatId,
            game_short_name: string,
            optional?: Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message>;

        setGameScore(
            user_id: number,
            score: number,
            optional?: {
                chat_id?: ChatId;
                force?: boolean;
                disable_edit_message?: boolean;
                message_id?: number;
                inline_message_id?: string;
            } & Omit<TelegramMessageOptional, "parse_mode">
        ): MethodResponse<Message | true>;

        getGameHighScores(
            user_id: number,
            optional?: {
                chat_id?: ChatId;
                message_id?: number;
                inline_message_id?: string;
            }
        ): MethodResponse<GameHighScore[]>;

        setWebhook(
            url: string,
            optional?: {
                certificate?: MethodInputFile;
                ip_address?: string;
                max_connections?: number;
                allowed_updates?: TelegramUpdateNames[];
                drop_pending_updates?: boolean;
            }
        ): MethodResponse<true>;

        deleteWebhook(optional?: {
            drop_pending_updates?: string;
        }): MethodResponse<true>;

        getWebhookInfo(): MethodResponse<WebhookInfo>;

        inlineKeyboard(keyboard: PropertyType<InlineKeyboardMarkup, "inline_keyboard">): InlineKeyboardMarkup;

        replyKeyboard(
            keyboard: PropertyType<ReplyKeyboardMarkup, "keyboard">,
            options?: Omit<ReplyKeyboardMarkup, "keyboard">
        ): ReplyKeyboardMarkup;

        replyKeyboardRemove(
            selective?: PropertyType<ReplyKeyboardRemove, "selective">,
        ): ReplyKeyboardRemove;

        forceReply(
            selective?: PropertyType<ForceReply, "selective">,
        ): ForceReply;
    }
}
