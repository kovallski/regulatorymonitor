"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("../../client/api");
const utils_1 = require("../../client/utils");
const button_1 = require("../../components/ui/button");
const card_1 = require("../../components/ui/card");
const input_1 = require("../../components/ui/input");
const label_1 = require("../../components/ui/label");
const separator_1 = require("../../components/ui/separator");
const skeleton_1 = require("../../components/ui/skeleton");
const date_picker_1 = require("../../components/ui/date-picker");
const badge_1 = require("../../components/ui/badge");
const lucide_react_1 = require("lucide-react");
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold tracking-tight", children: "\u0414\u0430\u0448\u0431\u043E\u0440\u0434" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0445 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439 \u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleFetchNews, disabled: fetchNewsMutation.isPending || !!processingTaskId, children: fetchNewsMutation.isPending ? "Загрузка..." : "Загрузить новости" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: handleExport, disabled: exportMutation.isPending, children: exportMutation.isPending ? "Экспорт..." : "Экспорт в Excel" })] })] }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "text-lg flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { className: "mr-2 h-4 w-4" }), "\u0424\u0438\u043B\u044C\u0442\u0440\u044B"] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "dateFrom", children: "\u0414\u0430\u0442\u0430 \u0441" }), (0, jsx_runtime_1.jsx)(date_picker_1.DatePicker, { value: dateFrom, onChange: setDateFrom, className: "w-full mt-1" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "dateTo", children: "\u0414\u0430\u0442\u0430 \u043F\u043E" }), (0, jsx_runtime_1.jsx)(date_picker_1.DatePicker, { value: dateTo, onChange: setDateTo, className: "w-full mt-1" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "sourceType", className: "block mb-2", children: "\u0422\u0438\u043F \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: sourceType === undefined ? "default" : "outline", size: "sm", onClick: () => setSourceType(undefined), children: "\u0412\u0441\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: sourceType === "website" ? "default" : "outline", size: "sm", onClick: () => setSourceType("website"), children: "\u0412\u0435\u0431-\u0441\u0430\u0439\u0442\u044B" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: sourceType === "telegram" ? "default" : "outline", size: "sm", onClick: () => setSourceType("telegram"), children: "Telegram" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "keywords", children: "\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "keywords", value: filterKeywords, onChange: (e) => setFilterKeywords(e.target.value), placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430 \u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E", className: "w-full mt-1" })] })] })] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: isLoadingNews ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: [...Array(3)].map((_, i) => ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-3/4" }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-2/3 mt-2" })] })] }, i))) })) : newsItems.length === 0 ? ((0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "text-center text-muted-foreground", children: "\u041D\u0435\u0442 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F" }) }) })) : (newsItems.map((item) => ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-lg", children: (0, jsx_runtime_1.jsx)("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: "hover:underline", children: item.title }) }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "mt-1", children: new Date(item.publishedAt).toLocaleString() })] }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", children: item.source.type })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: item.summary }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 flex flex-wrap gap-2", children: item.keywords.map((keyword) => ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", children: keyword.text }, keyword.id))) })] })] }, item.id)))) })] }));
}
exports.default = Dashboard;
