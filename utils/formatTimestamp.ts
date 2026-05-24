type FormatTimestampOptions = {
    includeDate?: boolean;
};

export function formatTimestamp(
    timestamp?: string,
    options: FormatTimestampOptions = {}
) {
    if (!timestamp) {
        return "";
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
    };

    if (options.includeDate) {
        formatOptions.day = "2-digit";
        formatOptions.month = "2-digit";
    }

    return new Intl.DateTimeFormat("pl-PL", formatOptions).format(
        new Date(timestamp)
    );
}
