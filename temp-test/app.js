"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("./src/client/api");
const utils_1 = require("./src/client/utils");
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const ui_1 = require("./src/components/ui");
// Layout component
function Layout({ children }) {
    const location = (0, react_router_dom_1.useLocation)();
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-background", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex min-h-screen", children: [(0, jsx_runtime_1.jsxs)("div", { className: "hidden md:flex w-64 flex-col border-r bg-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-foreground", children: "TaxNewsRadar" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground mt-1", children: "\u041D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0439 \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433" })] }), (0, jsx_runtime_1.jsxs)("nav", { className: "flex-1 px-4 space-y-1", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", children: (0, jsx_runtime_1.jsxs)(ui_1.Button, { variant: location.pathname === "/" ? "secondary" : "ghost", className: "w-full justify-start", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Home, { className: "mr-2 h-4 w-4" }), "\u0414\u0430\u0448\u0431\u043E\u0440\u0434"] }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/settings", children: (0, jsx_runtime_1.jsxs)(ui_1.Button, { variant: location.pathname === "/settings" ? "secondary" : "ghost", className: "w-full justify-start", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "mr-2 h-4 w-4" }), "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"] }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/reports", children: (0, jsx_runtime_1.jsxs)(ui_1.Button, { variant: location.pathname === "/reports" ? "secondary" : "ghost", className: "w-full justify-start", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileSpreadsheet, { className: "mr-2 h-4 w-4" }), "\u041E\u0442\u0447\u0435\u0442\u044B"] }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex flex-col overflow-hidden", children: [(0, jsx_runtime_1.jsx)("header", { className: "md:hidden border-b p-4 bg-card", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold", children: "TaxNewsRadar" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", children: (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Home, { className: "h-5 w-5" }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/settings", children: (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-5 w-5" }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/reports", children: (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FileSpreadsheet, { className: "h-5 w-5" }) }) })] })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-auto p-6", children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.2 }, children: children }, location.pathname) })] })] }) }));
}
// Dashboard page
function Dashboard() {
    const queryClient = (0, react_query_1.useQueryClient)();
    const { toast } = (0, utils_1.useToast)();
    const [dateFrom, setDateFrom] = (0, react_1.useState)(undefined);
    const [dateTo, setDateTo] = (0, react_1.useState)(undefined);
    const [filterKeywords, setFilterKeywords] = (0, react_1.useState)("");
    const [sourceType, setSourceType] = (0, react_1.useState)(undefined);
    // Fetch news
    const { data: newsItems = [], isLoading: isLoadingNews } = (0, react_query_1.useQuery)({
        queryKey: ['news', { dateFrom, dateTo, filterKeywords, sourceType }],
        queryFn: () => api_1.apiClient.getNews({
            dateFrom: dateFrom === null || dateFrom === void 0 ? void 0 : dateFrom.toISOString(),
            dateTo: dateTo === null || dateTo === void 0 ? void 0 : dateTo.toISOString(),
            keywords: filterKeywords ? filterKeywords.split(',').map(k => k.trim()) : undefined,
            sourceType,
        }),
    });
    // Fetch keywords for suggestions
    const { data: keywords = [] } = (0, react_query_1.useQuery)({
        queryKey: ['keywords'],
        queryFn: api_1.apiClient.listKeywords,
    });
    // Task status for news processing
    const [processingTaskId, setProcessingTaskId] = (0, react_1.useState)(null);
    // Polling for task status
    const { data: processingStatus } = (0, react_query_1.useQuery)({
        queryKey: ['processingStatus', processingTaskId],
        queryFn: () => api_1.apiClient.getNewsProcessingStatus({ taskId: processingTaskId }),
        enabled: !!processingTaskId,
        refetchInterval: processingTaskId ? 5000 : false,
    });
    // Fetch and process news mutation
    const fetchNewsMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.fetchAndProcessNews,
        onSuccess: (data) => {
            if (data.taskId) {
                setProcessingTaskId(String(data.taskId));
            }
        },
    });
    // Export to Excel mutation
    const exportMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.exportToExcel,
        onSuccess: (data) => {
            window.open(data.fileUrl, '_blank');
            toast({
                title: 'Отчет сгенерирован',
                description: `Экспортировано ${data.itemCount} новостей`,
            });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
    const removeKeywordMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.removeKeyword,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['keywords'] });
        },
    });
    const deleteSourceMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.deleteSource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sources'] });
            toast({
                title: "Источник удален",
            });
        },
    });
    const handleRemoveKeyword = (id) => {
        removeKeywordMutation.mutate({ id });
    };
    const handleDeleteSource = (id) => {
        deleteSourceMutation.mutate({ id });
    };
    const handleFetchNews = () => {
        if (fetchNewsMutation.isPending)
            return;
        fetchNewsMutation.mutate();
    };
    const handleExport = () => {
        if (exportMutation.isPending)
            return;
        exportMutation.mutate({
            dateFrom: dateFrom === null || dateFrom === void 0 ? void 0 : dateFrom.toISOString(),
            dateTo: dateTo === null || dateTo === void 0 ? void 0 : dateTo.toISOString(),
            keywords: filterKeywords ? filterKeywords.split(',').map(k => k.trim()) : undefined,
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold tracking-tight", children: "\u0414\u0430\u0448\u0431\u043E\u0440\u0434" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439 \u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Button, { onClick: handleFetchNews, disabled: fetchNewsMutation.isPending || !!processingTaskId, children: fetchNewsMutation.isPending ? "Загрузка..." : "Загрузить новости" }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "outline", onClick: handleExport, disabled: exportMutation.isPending, children: exportMutation.isPending ? "Экспорт..." : "Экспорт в Excel" })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Separator, {}), (0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsx)(ui_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(ui_1.CardTitle, { className: "text-lg flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { className: "mr-2 h-4 w-4" }), "\u0424\u0438\u043B\u044C\u0442\u0440\u044B"] }) }), (0, jsx_runtime_1.jsx)(ui_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "dateFrom", children: "\u0414\u0430\u0442\u0430 \u0441" }), (0, jsx_runtime_1.jsx)(ui_1.DatePicker, { value: dateFrom, onChange: setDateFrom, className: "w-full mt-1" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "dateTo", children: "\u0414\u0430\u0442\u0430 \u043F\u043E" }), (0, jsx_runtime_1.jsx)(ui_1.DatePicker, { value: dateTo, onChange: setDateTo, className: "w-full mt-1" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "sourceType", className: "block mb-2", children: "\u0422\u0438\u043F \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Button, { variant: sourceType === undefined ? "default" : "outline", size: "sm", onClick: () => setSourceType(undefined), children: "\u0412\u0441\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438" }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: sourceType === "website" ? "default" : "outline", size: "sm", onClick: () => setSourceType("website"), children: "\u0412\u0435\u0431-\u0441\u0430\u0439\u0442\u044B" }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: sourceType === "telegram" ? "default" : "outline", size: "sm", onClick: () => setSourceType("telegram"), children: "Telegram-\u043A\u0430\u043D\u0430\u043B\u044B" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "keywords", className: "block mb-2", children: "\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430 (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E)" }), (0, jsx_runtime_1.jsx)(ui_1.Input, { id: "keywords", value: filterKeywords, onChange: (e) => setFilterKeywords(e.target.value), placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0414\u0421, \u043D\u0430\u043B\u043E\u0433 \u043D\u0430 \u043F\u0440\u0438\u0431\u044B\u043B\u044C", className: "mb-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [keywords.slice(0, 5).map((keyword) => ((0, jsx_runtime_1.jsx)(ui_1.Badge, { variant: "outline", className: "cursor-pointer", onClick: () => {
                                                                const currentKeywords = filterKeywords
                                                                    .split(",")
                                                                    .map((k) => k.trim())
                                                                    .filter((k) => k !== "");
                                                                if (!currentKeywords.includes(keyword.text)) {
                                                                    setFilterKeywords(currentKeywords.length > 0
                                                                        ? `${filterKeywords}, ${keyword.text}`
                                                                        : keyword.text);
                                                                }
                                                            }, children: keyword.text }, keyword.id))), keywords.length > 5 && ((0, jsx_runtime_1.jsxs)(ui_1.Badge, { variant: "outline", children: ["+", keywords.length - 5] }))] })] })] })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-xl font-semibold", children: ["\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B (", newsItems.length, ")"] }), isLoadingNews ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => ((0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsxs)(ui_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-6 w-3/4" }), (0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-4 w-1/4 mt-2" })] }), (0, jsx_runtime_1.jsxs)(ui_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-4 w-full" }), (0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-4 w-full mt-2" }), (0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-4 w-3/4 mt-2" })] })] }, i))) })) : newsItems.length === 0 ? ((0, jsx_runtime_1.jsx)(ui_1.Card, { children: (0, jsx_runtime_1.jsxs)(ui_1.CardContent, { className: "flex flex-col items-center justify-center p-6", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-12 w-12 text-muted-foreground mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium", children: "\u041D\u0435\u0442 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground text-center mt-1", children: "\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440\u044B \u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \"\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u043E\u0432\u043E\u0441\u0442\u0438\"" })] }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: newsItems.map((item) => ((0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsxs)(ui_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsx)(ui_1.CardTitle, { children: item.title }), (0, jsx_runtime_1.jsx)(ui_1.Badge, { variant: "outline", children: new Date(item.publishedAt).toLocaleDateString("ru-RU") })] }), (0, jsx_runtime_1.jsxs)(ui_1.CardDescription, { children: ["\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: ", item.sourceName, item.documentRef && ` | ${item.documentRef}`, item.taxType && ` | ${item.taxType}`] })] }), (0, jsx_runtime_1.jsxs)(ui_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: item.summary }), item.subject && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u0438\u044F:" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: item.subject })] })), item.position && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: "\u041F\u043E\u0437\u0438\u0446\u0438\u044F \u041C\u0424/\u0424\u041D\u0421:" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: item.position })] }))] }), (0, jsx_runtime_1.jsx)(ui_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(ui_1.Button, { variant: "ghost", size: "sm", onClick: () => {
                                            window.open(item.sourceUrl, "_blank");
                                            // Если это Telegram-канал без прямой ссылки на сообщение
                                            if (item.sourceUrl.includes("t.me/") &&
                                                !item.sourceUrl.includes("t.me/s/") &&
                                                !item.sourceUrl.includes("t.me/c/") &&
                                                !item.sourceUrl.includes("/")) {
                                                toast({
                                                    title: "Внимание",
                                                    description: "Ссылка ведет на общий канал Telegram, а не на конкретное сообщение",
                                                    variant: "default",
                                                });
                                            }
                                        }, children: ["\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0443", (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: "ml-1 h-4 w-4" })] }) })] }, item.id))) }))] })] }));
}
// Settings page
function SettingsPage() {
    const queryClient = (0, react_query_1.useQueryClient)();
    const { toast } = (0, utils_1.useToast)();
    const [newKeyword, setNewKeyword] = (0, react_1.useState)("");
    const [newSourceName, setNewSourceName] = (0, react_1.useState)("");
    const [newSourceUrl, setNewSourceUrl] = (0, react_1.useState)("");
    const [newSourceType, setNewSourceType] = (0, react_1.useState)("website");
    const [emailAddress, setEmailAddress] = (0, react_1.useState)("");
    const [emailEnabled, setEmailEnabled] = (0, react_1.useState)(false);
    const [emailFrequency, setEmailFrequency] = (0, react_1.useState)("DAILY");
    const [websiteGroupOpen, setWebsiteGroupOpen] = (0, react_1.useState)(true);
    const [telegramGroupOpen, setTelegramGroupOpen] = (0, react_1.useState)(true);
    const [newGroupName, setNewGroupName] = (0, react_1.useState)("");
    const [sourceGroups, setSourceGroups] = (0, react_1.useState)([]);
    // Fetch sources
    const { data: sources = [], isLoading: isLoadingSources } = (0, react_query_1.useQuery)({
        queryKey: ['sources'],
        queryFn: api_1.apiClient.listSources,
    });
    // Fetch keywords
    const { data: keywords = [], isLoading: isLoadingKeywords } = (0, react_query_1.useQuery)({
        queryKey: ['keywords'],
        queryFn: api_1.apiClient.listKeywords,
    });
    // Fetch email settings
    const { data: emailSettings } = (0, react_query_1.useQuery)({
        queryKey: ['emailSettings'],
        queryFn: api_1.apiClient.getEmailSettings,
    });
    // Initialize source groups
    (0, react_1.useEffect)(() => {
        if (sources && sources.length > 0) {
            // You could load groups from localStorage or an API
            // For now, we'll just create a default group if none exists
            if (sourceGroups.length === 0) {
                setSourceGroups([
                    {
                        id: "official",
                        name: "Официальные источники",
                        sources: sources.filter((s) => s.name.includes("ФНС") ||
                            s.name.includes("Минфин") ||
                            s.name.includes("Правительство")),
                    },
                    {
                        id: "commercial",
                        name: "Коммерческие источники",
                        sources: sources.filter((s) => s.name.includes("Консультант") ||
                            s.name.includes("Групп") ||
                            s.name.includes("B1")),
                    },
                ]);
            }
        }
    }, [sources]);
    // Toggle source mutation
    const toggleSourceMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.toggleSource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sources'] });
        },
    });
    // Toggle sources by type mutation
    const toggleSourcesByTypeMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.toggleSourcesByType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sources'] });
        },
    });
    // Toggle sources by ids mutation
    const toggleSourcesByIdsMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.toggleSourcesByIds,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sources'] });
        },
    });
    // Delete source mutation
    const deleteSourceMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.deleteSource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sources'] });
            toast({
                title: "Источник удален",
            });
        },
    });
    // Add source mutation
    const addSourceMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.addSource,
        onSuccess: () => {
            setNewSourceName("");
            setNewSourceUrl("");
            setNewSourceType("website");
            queryClient.invalidateQueries({ queryKey: ['sources'] });
            toast({
                title: "Источник добавлен",
            });
        },
    });
    // Update email settings mutation
    const updateEmailSettingsMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.updateEmailSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
            toast({
                title: "Настройки email обновлены",
            });
        },
    });
    // Send test email mutation
    const sendTestEmailMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.sendNewsEmailSummary,
        onSuccess: () => {
            toast({
                title: "Тестовое письмо отправлено",
                description: "Проверьте ваш почтовый ящик",
            });
        },
    });
    // Add keyword mutation
    const addKeywordMutation = (0, react_query_1.useMutation)({
        mutationFn: api_1.apiClient.addKeyword,
        onSuccess: () => {
            setNewKeyword("");
            queryClient.invalidateQueries({ queryKey: ['keywords'] });
            toast({
                title: "Ключевое слово добавлено",
            });
        },
    });
    const handleAddKeyword = (e) => {
        e.preventDefault();
        if (newKeyword.trim()) {
            addKeywordMutation.mutate({ text: newKeyword.trim() });
        }
    };
    const handleAddSource = () => {
        if (addSourceMutation.isPending)
            return;
        addSourceMutation.mutate({
            name: newSourceName,
            url: newSourceUrl,
            type: newSourceType,
        });
    };
    const handleUpdateEmailSettings = (e) => {
        e.preventDefault();
        if (emailAddress.trim()) {
            updateEmailSettingsMutation.mutate({
                email: emailAddress.trim(),
                isEnabled: emailEnabled,
                summaryFrequency: emailFrequency,
            });
        }
    };
    const handleSendTestEmail = () => {
        if (emailAddress.trim()) {
            sendTestEmailMutation.mutate({ email: emailAddress.trim() });
        }
    };
    // Source group management functions
    const handleAddGroup = () => {
        if (!newGroupName.trim())
            return;
        const newGroup = {
            id: `group-${Date.now()}`,
            name: newGroupName.trim(),
            sources: [],
        };
        setSourceGroups([...sourceGroups, newGroup]);
        setNewGroupName("");
        toast({
            title: "Группа создана",
            description: `Группа "${newGroupName}" успешно создана`,
        });
    };
    const handleDeleteGroup = (groupId) => {
        setSourceGroups(sourceGroups.filter((group) => group.id !== groupId));
        toast({
            title: "Группа удалена",
        });
    };
    const handleAddToGroup = (groupId, sourceId) => {
        const source = sources.find((s) => s.id === sourceId);
        if (!source)
            return;
        setSourceGroups(sourceGroups.map((group) => {
            if (group.id === groupId) {
                return Object.assign(Object.assign({}, group), { sources: [...group.sources, source] });
            }
            return group;
        }));
    };
    const handleRemoveFromGroup = (groupId, sourceId) => {
        setSourceGroups(sourceGroups.map((group) => {
            if (group.id === groupId) {
                return Object.assign(Object.assign({}, group), { sources: group.sources.filter((s) => s.id !== sourceId) });
            }
            return group;
        }));
    };
    const handleDeleteSource = (id) => {
        deleteSourceMutation.mutate({ id });
    };
    const websiteSources = sources.filter((source) => source.type === "website");
    const telegramSources = sources.filter((source) => source.type === "telegram");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold tracking-tight", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430\u043C\u0438 \u0438 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u043C\u0438 \u0441\u043B\u043E\u0432\u0430\u043C\u0438" })] }), (0, jsx_runtime_1.jsx)(ui_1.Separator, {}), (0, jsx_runtime_1.jsxs)(ui_1.Tabs, { defaultValue: "sources", children: [(0, jsx_runtime_1.jsxs)(ui_1.TabsList, { children: [(0, jsx_runtime_1.jsx)(ui_1.TabsTrigger, { value: "sources", children: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438" }), (0, jsx_runtime_1.jsx)(ui_1.TabsTrigger, { value: "keywords", children: "\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430" }), (0, jsx_runtime_1.jsx)(ui_1.TabsTrigger, { value: "email", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0438 \u043E\u0442\u0447\u0435\u0442\u044B" })] }), (0, jsx_runtime_1.jsxs)(ui_1.TabsContent, { value: "sources", className: "space-y-4 mt-4", children: [(0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsxs)(ui_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(ui_1.CardTitle, { children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A" }), (0, jsx_runtime_1.jsx)(ui_1.CardDescription, { children: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u0434\u043B\u044F \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0430" })] }), (0, jsx_runtime_1.jsx)(ui_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleAddSource, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "sourceName", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430" }), (0, jsx_runtime_1.jsx)(ui_1.Input, { id: "sourceName", value: newSourceName, onChange: (e) => setNewSourceName(e.target.value), placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0439 \u043F\u043E\u0440\u0442\u0430\u043B" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "sourceUrl", children: "URL \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430" }), (0, jsx_runtime_1.jsx)(ui_1.Input, { id: "sourceUrl", value: newSourceUrl, onChange: (e) => setNewSourceUrl(e.target.value), placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: https://example.com \u0438\u043B\u0438 t.me/channel" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "sourceType", children: "\u0422\u0438\u043F \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Button, { type: "button", variant: newSourceType === "website" ? "default" : "outline", onClick: () => setNewSourceType("website"), children: "\u0412\u0435\u0431-\u0441\u0430\u0439\u0442" }), (0, jsx_runtime_1.jsx)(ui_1.Button, { type: "button", variant: newSourceType === "telegram" ? "default" : "outline", onClick: () => setNewSourceType("telegram"), children: "Telegram-\u043A\u0430\u043D\u0430\u043B" })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Button, { type: "submit", disabled: addSourceMutation.isPending, children: addSourceMutation.isPending ? "Добавление..." : "Добавить источник" })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { className: "text-lg font-semibold", children: "\u0413\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u043A\u0430 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-muted-foreground mb-2", children: "\u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u044B \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432 \u0434\u043B\u044F \u0443\u0434\u043E\u0431\u043D\u043E\u0433\u043E \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Input, { placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043D\u043E\u0432\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B", value: newGroupName, onChange: (e) => setNewGroupName(e.target.value) }), (0, jsx_runtime_1.jsxs)(ui_1.Button, { onClick: handleAddGroup, disabled: !newGroupName.trim(), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }), "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"] })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Separator, {}), (0, jsx_runtime_1.jsxs)(ui_1.Collapsible, { open: websiteGroupOpen, onOpenChange: setWebsiteGroupOpen, className: "w-full", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(ui_1.CollapsibleTrigger, { children: (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "flex items-center p-0 hover:bg-transparent text-sm font-medium bg-transparent border-0", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: `h-4 w-4 transition-transform ${websiteGroupOpen ? "rotate-90" : ""}` }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold ml-2", children: "\u0412\u0435\u0431-\u0441\u0430\u0439\u0442\u044B" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: websiteSources.some((s) => s.isEnabled), onCheckedChange: (checked) => {
                                                                    toggleSourcesByTypeMutation.mutate({
                                                                        type: "website",
                                                                        isEnabled: checked,
                                                                    });
                                                                    toast({
                                                                        title: checked
                                                                            ? "Все веб-сайты включены"
                                                                            : "Все веб-сайты отключены",
                                                                    });
                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Badge, { children: websiteSources.length })] })] }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleContent, { className: "mt-2", children: (0, jsx_runtime_1.jsx)(ui_1.Card, { children: (0, jsx_runtime_1.jsx)(ui_1.CardContent, { className: "pt-4", children: isLoadingSources ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, i) => ((0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-8 w-full" }, i))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: websiteSources.map((source) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b pb-2 last:border-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: source.isEnabled, onCheckedChange: (checked) => {
                                                                                    toggleSourceMutation.mutate({
                                                                                        id: source.id,
                                                                                        isEnabled: checked,
                                                                                    });
                                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Label, { children: source.name })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground truncate max-w-[200px]", children: source.url }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 p-0", onClick: () => handleDeleteSource(source.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] }, source.id))) })) }) }) })] }), (0, jsx_runtime_1.jsxs)(ui_1.Collapsible, { open: telegramGroupOpen, onOpenChange: setTelegramGroupOpen, className: "w-full", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(ui_1.CollapsibleTrigger, { children: (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "flex items-center p-0 hover:bg-transparent text-sm font-medium bg-transparent border-0", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: `h-4 w-4 transition-transform ${telegramGroupOpen ? "rotate-90" : ""}` }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold ml-2", children: "Telegram-\u043A\u0430\u043D\u0430\u043B\u044B" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: telegramSources.some((s) => s.isEnabled), onCheckedChange: (checked) => {
                                                                    toggleSourcesByTypeMutation.mutate({
                                                                        type: "telegram",
                                                                        isEnabled: checked,
                                                                    });
                                                                    toast({
                                                                        title: checked
                                                                            ? "Все Telegram-каналы включены"
                                                                            : "Все Telegram-каналы отключены",
                                                                    });
                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Badge, { children: telegramSources.length })] })] }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleContent, { className: "mt-2", children: (0, jsx_runtime_1.jsx)(ui_1.Card, { children: (0, jsx_runtime_1.jsx)(ui_1.CardContent, { className: "pt-4", children: isLoadingSources ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: Array.from({ length: 3 }).map((_, i) => ((0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-8 w-full" }, i))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: telegramSources.map((source) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b pb-2 last:border-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: source.isEnabled, onCheckedChange: (checked) => {
                                                                                    toggleSourceMutation.mutate({
                                                                                        id: source.id,
                                                                                        isEnabled: checked,
                                                                                    });
                                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Label, { children: source.name })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground truncate max-w-[200px]", children: source.url }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 p-0", onClick: () => handleDeleteSource(source.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] }, source.id))) })) }) }) })] }), sourceGroups.map((group) => ((0, jsx_runtime_1.jsxs)(ui_1.Collapsible, { className: "w-full", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(ui_1.CollapsibleTrigger, { children: (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "flex items-center p-0 hover:bg-transparent text-sm font-medium bg-transparent border-0", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold ml-2", children: group.name })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: group.sources.some((s) => s.isEnabled), onCheckedChange: (checked) => {
                                                                    const sourceIds = group.sources.map((s) => s.id);
                                                                    if (sourceIds.length === 0)
                                                                        return;
                                                                    toggleSourcesByIdsMutation.mutate({
                                                                        ids: sourceIds,
                                                                        isEnabled: checked,
                                                                    });
                                                                    toast({
                                                                        title: checked
                                                                            ? `Группа "${group.name}" включена`
                                                                            : `Группа "${group.name}" отключена`,
                                                                    });
                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Badge, { children: group.sources.length }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", className: "text-destructive hover:text-destructive hover:bg-destructive/10", onClick: () => handleDeleteGroup(group.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleContent, { className: "mt-2", children: (0, jsx_runtime_1.jsx)(ui_1.Card, { children: (0, jsx_runtime_1.jsx)(ui_1.CardContent, { className: "pt-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [group.sources.map((source) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b pb-2 last:border-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: source.isEnabled, onCheckedChange: (checked) => {
                                                                                        toggleSourceMutation.mutate({
                                                                                            id: source.id,
                                                                                            isEnabled: checked,
                                                                                        });
                                                                                    } }), (0, jsx_runtime_1.jsx)(ui_1.Label, { children: source.name })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Badge, { variant: "outline", children: source.type === "website"
                                                                                        ? "Веб-сайт"
                                                                                        : "Telegram" }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-foreground", onClick: () => handleRemoveFromGroup(group.id, source.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })] }, source.id))), (0, jsx_runtime_1.jsx)("div", { className: "pt-2", children: (0, jsx_runtime_1.jsxs)(ui_1.Select, { onValueChange: (value) => handleAddToGroup(group.id, value), children: [(0, jsx_runtime_1.jsx)(ui_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(ui_1.SelectValue, { placeholder: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u0432 \u0433\u0440\u0443\u043F\u043F\u0443" }) }), (0, jsx_runtime_1.jsx)(ui_1.SelectContent, { children: sources
                                                                                    .filter((source) => !group.sources.some((s) => s.id === source.id))
                                                                                    .map((source) => ((0, jsx_runtime_1.jsxs)(ui_1.SelectItem, { value: source.id, children: [source.name, " (", source.type === "website"
                                                                                            ? "Веб-сайт"
                                                                                            : "Telegram", ")"] }, source.id))) })] }) })] }) }) }) })] }, group.id)))] })] }), (0, jsx_runtime_1.jsxs)(ui_1.TabsContent, { value: "keywords", className: "space-y-4 mt-4", children: [(0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsxs)(ui_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(ui_1.CardTitle, { children: "\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430" }), (0, jsx_runtime_1.jsx)(ui_1.CardDescription, { children: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430 \u0434\u043B\u044F \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u0438 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439" })] }), (0, jsx_runtime_1.jsxs)(ui_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("form", { onSubmit: handleAddKeyword, className: "flex space-x-2 mb-4", children: [(0, jsx_runtime_1.jsx)(ui_1.Input, { value: newKeyword, onChange: (e) => setNewKeyword(e.target.value), placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E" }), (0, jsx_runtime_1.jsxs)(ui_1.Button, { type: "submit", disabled: !newKeyword.trim() || addKeywordMutation.isPending, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4" }), "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"] })] }), isLoadingKeywords ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, i) => ((0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-8 w-full" }, i))) })) : keywords.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "\u041D\u0435\u0442 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u0441\u043B\u043E\u0432" }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: keywords.map((keyword) => ((0, jsx_runtime_1.jsxs)(ui_1.Badge, { variant: "secondary", className: "flex items-center gap-1", children: [keyword.text, (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 p-0", onClick: () => { }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] }, keyword.id))) }))] })] }), (0, jsx_runtime_1.jsxs)(ui_1.Alert, { children: [(0, jsx_runtime_1.jsx)(ui_1.AlertTitle, { children: "\u0421\u043E\u0432\u0435\u0442" }), (0, jsx_runtime_1.jsx)(ui_1.AlertDescription, { children: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430, \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u0435 \u0441 \u043D\u0430\u043B\u043E\u0433\u0430\u043C\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0432\u0430\u0441 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u0443\u044E\u0442. \u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0414\u0421, \u041D\u0414\u0424\u041B, \u043D\u0430\u043B\u043E\u0433 \u043D\u0430 \u043F\u0440\u0438\u0431\u044B\u043B\u044C, \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0439 \u0432\u044B\u0447\u0435\u0442 \u0438 \u0442.\u0434." })] })] }), (0, jsx_runtime_1.jsxs)(ui_1.TabsContent, { value: "email", className: "space-y-4 mt-4", children: [(0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsxs)(ui_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(ui_1.CardTitle, { children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 Email-\u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439" }), (0, jsx_runtime_1.jsx)(ui_1.CardDescription, { children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0443 \u0441\u0432\u043E\u0434\u043A\u0438 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439 \u043D\u0430 \u0432\u0430\u0448 email" })] }), (0, jsx_runtime_1.jsx)(ui_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleUpdateEmailSettings, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "email", children: "Email-\u0430\u0434\u0440\u0435\u0441" }), (0, jsx_runtime_1.jsx)(ui_1.Input, { id: "email", type: "email", value: emailAddress, onChange: (e) => setEmailAddress(e.target.value), placeholder: "example@example.com" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { id: "emailEnabled", checked: emailEnabled, onCheckedChange: setEmailEnabled }), (0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "emailEnabled", children: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "frequency", children: "\u0427\u0430\u0441\u0442\u043E\u0442\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438" }), (0, jsx_runtime_1.jsxs)(ui_1.Select, { value: emailFrequency, onValueChange: setEmailFrequency, children: [(0, jsx_runtime_1.jsx)(ui_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(ui_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(ui_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(ui_1.SelectItem, { value: "DAILY", children: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E" }), (0, jsx_runtime_1.jsx)(ui_1.SelectItem, { value: "WEEKLY", children: "\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E" }), (0, jsx_runtime_1.jsx)(ui_1.SelectItem, { value: "MONTHLY", children: "\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u043E" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Button, { type: "submit", disabled: !emailAddress.trim(), children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), (0, jsx_runtime_1.jsx)(ui_1.Button, { type: "button", variant: "outline", onClick: handleSendTestEmail, disabled: !emailAddress.trim() || sendTestEmailMutation.isPending, children: sendTestEmailMutation.isPending ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4 animate-spin" }), "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430..."] })) : ("Отправить тестовое письмо") })] })] }) })] }), (0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsxs)(ui_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(ui_1.CardTitle, { children: "\u0421\u0443\u043C\u043C\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439" }), (0, jsx_runtime_1.jsx)(ui_1.CardDescription, { children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0432\u043E\u0434\u043A\u0438 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439" })] }), (0, jsx_runtime_1.jsxs)(ui_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)(ui_1.Alert, { children: [(0, jsx_runtime_1.jsx)(ui_1.AlertTitle, { children: "\u041A\u0430\u043A \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0441\u0443\u043C\u043C\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044F" }), (0, jsx_runtime_1.jsx)(ui_1.AlertDescription, { children: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0444\u043E\u0440\u043C\u0438\u0440\u0443\u0435\u0442 \u0441\u0432\u043E\u0434\u043A\u0443 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432 \u0438 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u0441\u043B\u043E\u0432. \u0421\u0432\u043E\u0434\u043A\u0430 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0432 \u0441\u0435\u0431\u044F \u043A\u0440\u0430\u0442\u043A\u043E\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439, \u0441\u0441\u044B\u043B\u043A\u0438 \u043D\u0430 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 \u0438 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043E \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0445. \u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u044D\u0442\u0438 \u0441\u0432\u043E\u0434\u043A\u0438 \u043D\u0430 email \u0441 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0439 \u043F\u0435\u0440\u0438\u043E\u0434\u0438\u0447\u043D\u043E\u0441\u0442\u044C\u044E." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium", children: "\u0421\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u0441\u0432\u043E\u0434\u043A\u0438:" }), (0, jsx_runtime_1.jsxs)("ul", { className: "list-disc pl-5 space-y-1", children: [(0, jsx_runtime_1.jsx)("li", { children: "\u041D\u043E\u0432\u043E\u0441\u0442\u0438 \u0441 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u043E\u0432 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u043E\u0440\u0433\u0430\u043D\u043E\u0432" }), (0, jsx_runtime_1.jsx)("li", { children: "\u041D\u043E\u0432\u043E\u0441\u0442\u0438 \u0438\u0437 Telegram-\u043A\u0430\u043D\u0430\u043B\u043E\u0432" }), (0, jsx_runtime_1.jsx)("li", { children: "\u041A\u0440\u0430\u0442\u043A\u0438\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432 \u0438 \u043F\u0438\u0441\u0435\u043C" }), (0, jsx_runtime_1.jsx)("li", { children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F\u0445" }), (0, jsx_runtime_1.jsx)("li", { children: "\u0421\u0441\u044B\u043B\u043A\u0438 \u043D\u0430 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 \u0434\u043B\u044F \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0433\u043E \u0438\u0437\u0443\u0447\u0435\u043D\u0438\u044F" })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6 p-4 border rounded-lg bg-muted/40", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col space-y-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "\u0421\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0432\u043E\u0434\u043A\u0443 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u043D\u0438\u0436\u0435, \u0447\u0442\u043E\u0431\u044B \u043D\u0435\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u0441\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0441\u0432\u043E\u0434\u043A\u0443 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439 \u043D\u0430 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0439 email" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-2 items-center justify-between", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium bg-primary/10 p-2 rounded-md w-full sm:w-auto", children: emailAddress || "Email не указан" }), (0, jsx_runtime_1.jsx)(ui_1.Button, { className: "w-full sm:w-auto", onClick: handleSendTestEmail, disabled: !emailAddress.trim() || sendTestEmailMutation.isPending, children: sendTestEmailMutation.isPending ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0424\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "mr-2 h-4 w-4" }), "\u0421\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441"] })) })] })] }) })] })] })] })] })] }));
}
// Reports page
function ReportsPage() {
    // Fetch reports
    const { data: reports = [], isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['reports'],
        queryFn: api_1.apiClient.listReports,
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold tracking-tight", children: "\u041E\u0442\u0447\u0435\u0442\u044B" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043E\u0442\u0447\u0435\u0442\u043E\u0432" })] }), (0, jsx_runtime_1.jsx)(ui_1.Separator, {}), isLoading ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => ((0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsx)(ui_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-6 w-3/4" }) }), (0, jsx_runtime_1.jsxs)(ui_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-4 w-full" }), (0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-4 w-3/4 mt-2" })] })] }, i))) })) : reports.length === 0 ? ((0, jsx_runtime_1.jsx)(ui_1.Card, { children: (0, jsx_runtime_1.jsxs)(ui_1.CardContent, { className: "flex flex-col items-center justify-center p-6", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileSpreadsheet, { className: "h-12 w-12 text-muted-foreground mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium", children: "\u041D\u0435\u0442 \u043E\u0442\u0447\u0435\u0442\u043E\u0432" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground text-center mt-1", children: "\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u043E\u0442\u0447\u0435\u0442 \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u0414\u0430\u0448\u0431\u043E\u0440\u0434" })] }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: reports.map((report) => ((0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsxs)(ui_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(ui_1.CardTitle, { children: report.name }), (0, jsx_runtime_1.jsxs)(ui_1.CardDescription, { children: ["\u0421\u043E\u0437\u0434\u0430\u043D: ", new Date(report.createdAt).toLocaleString("ru-RU")] })] }), (0, jsx_runtime_1.jsx)(ui_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 mr-2 text-muted-foreground" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm", children: ["\u041F\u0435\u0440\u0438\u043E\u0434:", " ", new Date(report.dateFrom).toLocaleDateString("ru-RU"), " -", " ", new Date(report.dateTo).toLocaleDateString("ru-RU")] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-4 w-4 mr-2 text-muted-foreground" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm", children: ["\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0437\u0430\u043F\u0438\u0441\u0435\u0439: ", report.itemCount] })] }), report.keywordsUsed && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 mr-2 text-muted-foreground" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm", children: ["\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430: ", report.keywordsUsed] })] }))] }) }), (0, jsx_runtime_1.jsx)(ui_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(ui_1.Button, { variant: "outline", onClick: () => window.open(report.fileUrl, "_blank"), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }), "\u0421\u043A\u0430\u0447\u0430\u0442\u044C Excel"] }) })] }, report.id))) }))] }));
}
function App() {
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Layout, { children: (0, jsx_runtime_1.jsx)(Dashboard, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/settings", element: (0, jsx_runtime_1.jsx)(Layout, { children: (0, jsx_runtime_1.jsx)(SettingsPage, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/reports", element: (0, jsx_runtime_1.jsx)(Layout, { children: (0, jsx_runtime_1.jsx)(ReportsPage, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(Layout, { children: (0, jsx_runtime_1.jsx)(Dashboard, {}) }) })] }) }));
}
