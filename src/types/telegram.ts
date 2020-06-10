export type TelegramBotToken = string;

export type TelegramResponse<T = undefined> = {
    ok: boolean;
    result: T;
    error_code?: number;
    description?: string;
    parameters?: ResponseParameters;
};

export type TelegramErrorResponse =
    Pick<TelegramResponse, "ok" | "parameters"> &
    Required<Pick<TelegramResponse, "error_code" | "description">>;

export type Update = {
    update_id: number;
    message?: Message;
    edited_message?: Message;
    channel_post?: Message;
    edited_channel_post?: Message;
    inline_query?: InlineQuery;
    chosen_inline_result?: ChosenInlineResult;
    callback_query?: CallbackQuery;
    shipping_query?: ShippingQuery;
    pre_checkout_query?: PreCheckoutQuery;
    poll?: Poll;
    poll_answer?: PollAnswer;
};

export type WebhookInfo = {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: boolean;
    last_error_message?: string;
    max_connections?: number;
    allowed_updates?: UpdateTypes;
};

export type GameHighScore = {
    position: number;
    user: User;
    score: number;
};

export type InlineQueryResult = any; // TODO
export type PassportElementError = any; // TODO

export type UpdateTypes = string[]; // TODO: keyof Update

export type ChatId = number | string;

export type InputFile = string;

export type BotInputFile = InputFile | string;

export type InlineQuery = {
    id: string;
    from: User;
    location?: Location;
    query: string;
    offset: string;
};

export type ChosenInlineResult = {
    result_id: string;
    from: User;
    location?: Location;
    inline_message_id?: string;
    query: string;
};

export type User = {
    id: string;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
};

export type MessageEntity = {
    type: "mention" | "hashtag" | "cashtag" | "bot_command" | "url" | "email" | "phone_number" | "bold" | "italic" |
        "underline" | "strikethrough" | "code" | "pre" | "text_link" | "text_mention";
    offset: number;
    length: number;
    url?: string;
    user?: User;
    language?: string;
};

export type WebhookResponse = true;

export type Message = {
    message_id: number;
    from?: User;
    via_bot?: User;
    date: number;
    chat: Chat;
    forward_from?: User;
    forward_from_chat?: Chat;
    forward_from_message_id?: number;
    forward_signature?: string;
    forward_sender_name?: string;
    forward_date?: number;
    reply_to_message?: Message;
    edit_date?: number;
    media_group_id?: string;
    author_signature?: string;
    text?: string;
    entities?: MessageEntity[];
    caption_entities?: MessageEntity[];
    audio?: Audio;
    document?: Document;
    animation?: Animation;
    game?: Game;
    photo?: PhotoSize[];
    sticker?: Sticker;
    video?: Video;
    voice?: Voice;
    video_note?: VideoNote;
    caption?: string;
    contact?: Contact;
    location?: Location;
    venue?: Venue;
    poll?: Poll;
    new_chat_members?: User[];
    left_chat_member?: User;
    new_chat_title?: string;
    new_chat_photo?: PhotoSize[];
    delete_chat_photo?: boolean;
    group_chat_created?: boolean;
    supergroup_chat_created?: boolean;
    channel_chat_created?: boolean;
    migrate_to_chat_id?: number;
    migrate_from_chat_id?: number;
    pinned_message?: Message;
    invoice?: Invoice;
    successful_payment?: SuccessfulPayment;
    connected_website?: string;
    passport_data?: PassportData;
    reply_markup?: InlineKeyboardMarkup;
};

export type PassportData = {
    data: EncryptedPassportElement[];
    credentials: EncryptedCredentials[];
};

export type PassportFile = FileIdentifier & {
    file_size: number;
    file_date: number;
};

export type EncryptedPassportElement = {
    type: "personal_details" | "passport" | "driver_license" | "identity_card" | "internal_passport" | "address" |
        "utility_bill" | "bank_statement" | "rental_agreement" | "passport_registration" | "temporary_registration" |
        "phone_number" | "email";
    data?: string;
    phone_number?: string;
    email?: string;
    files?: PassportFile[];
    front_side?: PassportFile[];
    reverse_side?: PassportFile[];
    selfie?: PassportFile[];
    translation?: PassportFile[];
    hash: string;
};

export type EncryptedCredentials = {
    data: string;
    hash: string;
    secret: string;
};

export type Invoice = {
    title: string;
    description: string;
    start_parameter: string;
    currency: string;
    total_amount: number;
};

export type ShippingAddress = {
    country_code: string;
    state: string;
    city: string;
    street_line1: string;
    street_line2: string;
    post_code: string;
};

export type OrderInfo = {
    name?: string;
    phone_number?: string;
    email?: string;
    shipping_address?: ShippingAddress;
};

export type ShippingOption = {
    id: string;
    title: string;
    prices: LabeledPrice[];
};

export type LabeledPrice = {
    label: string;
    amount: number;
};

export type SuccessfulPayment = {
    currency: string;
    total_amount: number;
    invoice_payload: string;
    shipping_option_id?: string;
    order_info?: OrderInfo;
    telegram_payment_charge_id: string;
    provider_payment_charge_id: string;
};

export type ShippingQuery = {
    id: string;
    user: User;
    invoice_payload: string;
    shipping_address: ShippingAddress;
};

export type PreCheckoutQuery = {
    id: string;
    from: User;
    currency: string;
    total_amount: number;
    invoice_payload: string;
    shipping_option_id?: string;
    order_info?: OrderInfo;
};

type FileIdentifier = {
    file_id: string;
    file_unique_id: string;
};

export type PhotoSize = FileIdentifier & {
    width: number;
    height: number;
    file_size?: number;
};

export type Document = FileIdentifier & {
    thumb?: PhotoSize;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
};

export type Audio = Omit<Document, "file_name"> & {
    duration: number;
    performer?: string;
    title?: string;
};

export type Video = Omit<Document, "file_name"> & {
    width: number;
    height: number;
    duration: number;
};

export type Animation = Document & {
    width: number;
    height: number;
    duration: number;
};

export type Voice = FileIdentifier & Pick<Document, "mime_type" | "file_size"> & {
    duration: number;
};

export type VoiceNote = FileIdentifier & Pick<Document, "thumb" | "file_size"> & {
    duration: number;
    length: number;
};

export type Contact = {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
    vcard?: string;
};

export type Location = {
    longitude: number;
    latitude: number;
};

export type Venue = {
    location: Location;
    title: string;
    address: string;
    foursquare_id?: string;
    foursquare_type?: string;
};

export type Game = {
    title: string;
    description: string;
    photo: PhotoSize[];
    text: string;
    text_entities?: MessageEntity[];
    animation?: Animation;
};

export type Sticker = FileIdentifier & {
    width: string;
    height: string;
    is_animated: boolean;
    thumb?: PhotoSize;
    emoji?: string;
    set_name?: string;
    mask_position?: MaskPosition;
    file_size?: number;
};

export type StickerSet = {
    name: string;
    title: string;
    is_animated: boolean;
    contains_masks: boolean;
    stickers: Sticker[];
};

export type MaskPosition = {
    point: string;
    x_shift: number;
    y_shift: number;
    scale: number;
};

export type VideoNote = FileIdentifier & {
    length: number;
    duration: number;
    thumb?: PhotoSize[];
    file_size?: number;
};

export type PollOption = {
    text: string;
    voter_count: number;
};

export type PollAnswer = {
    poll_id: string;
    user: User;
    option_ids: number[] | "";
};

export type PollType = "regular" | "quiz";

export type Poll = {
    id: string;
    question: User;
    options: PollOption[];
    total_voter_count: number;
    is_closed: boolean;
    is_anonymous: boolean;
    type: PollType;
    allows_multiple_answers: boolean;
    correct_option_id?: number;
};

export type UserProfilePhotos = {
    total_count: number;
    photos: Array<PhotoSize[]>;
};

export type File = FileIdentifier & {
    file_size?: number;
    file_path?: string;
};

export type BotCommand = {
    command: string;
    description: string;
};

export type ReplyKeyboardMarkup = {
    keyboard: Array<KeyboardButton[]>;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    selective?: boolean;
};

export type KeyboardButton = {
    text: string;
    request_contact?: boolean;
    request_location?: boolean;
    request_poll?: KeyboardButtonPollType;
};

export type KeyboardButtonPollType = {
    type?: PollType;
};

export type ReplyKeyboardRemove = {
    remove_keyboard: boolean;
    selective?: boolean;
};

export type InlineKeyboardMarkup = {
    inline_keyboard: Array<InlineKeyboardButton>;
};

type CallbackGame = "";

export type InlineKeyboardButton = {
    text: string;
    url: string;
    login_url?: LoginUrl;
    callback_data?: string;
    switch_inline_query?: string;
    switch_inline_query_current_chat?: string;
    callback_game?: CallbackGame;
    pay?: boolean;
};

export type LoginUrl = {
    url: string;
    forward_text?: string;
    bot_username?: string;
    request_write_access?: boolean;
};

export type CallbackQuery = {
    id: string;
    from: User;
    message?: Message;
    inline_message_id?: string;
    chat_instance: string;
    data?: string;
    game_short_name?: string;
};

export type ForceReply = {
    force_reply: true;
    selective?: boolean;
};

export type ChatType = "private" | "group" | "supergroup" | "channel";

export type Chat = {
    id: number;
    type: ChatType;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo?: ChatPhoto;
    description?: string;
    invite_link?: string;
    pinned_message?: Message;
    permissions?: ChatPermissions;
    slow_mode_delay?: number;
    sticker_set_name?: string;
    can_set_sticker_set?: boolean;
};

export type ChatPhoto = {
    small_file_id: string;
    small_file_unique_id: string;
    big_file_id: string;
    big_file_unique_id: string;
};

type ChatMemberStatus = "creator" | "administrator" | "member" | "restricted" | "left" | "kicked";

export type ChatMember = {
    user: User;
    status: ChatMemberStatus;
    custom_title?: string;
    until_date?: number;
    can_be_edited?: boolean;
    can_post_messages?: boolean;
    can_edit_messages?: boolean;
    can_delete_messages?: boolean;
    can_restrict_members?: boolean;
    can_promote_members?: boolean;
    is_member?: boolean;
} & ChatPermissions;

export type ChatPermissions = {
    can_send_messages?: boolean;
    can_send_media_messages?: boolean;
    can_send_polls?: boolean;
    can_send_other_messages?: boolean;
    can_add_web_page_previews?: boolean;
    can_change_info?: boolean;
    can_invite_users?: boolean;
    can_pin_messages?: boolean;
};

export type ResponseParameters = {
    migrate_to_chat_id?: number;
    retry_after?: number;
};

type InputMediaObject = {
    media: string;
    thumb?: InputFile;
    caption?: string;
    parse_mode?: ParseMode;
};

export type ParseMode = "markdown" | "html";

export type InputMedia = InputMediaAnimation | InputMediaDocument | InputMediaAudio | InputMediaPhoto | InputMediaVideo;

export type InputMediaPhoto = Omit<InputMediaObject, "thumb"> & {
    type: "photo";
};

export type InputMediaVideo = InputMediaObject & {
    type: "video";
    width?: number;
    height?: number;
    duration?: number;
    supports_streaming?: boolean;
};

export type InputMediaAnimation = InputMediaObject & {
    type: "animation";
    width?: number;
    height?: number;
    duration?: number;
};

export type InputMediaAudio = InputMediaObject & {
    type: "audio";
    duration?: number;
    performer?: string;
    title?: string;
};

export type InputMediaDocument = InputMediaObject & {
    type: "document";
};

export type ReplyMarkup = InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;

export type TelegramMessageOptional = {
    parse_mode?: ParseMode;
    disable_notification?: boolean;
    reply_to_message_id?: number;
    reply_markup?: ReplyMarkup;
};
