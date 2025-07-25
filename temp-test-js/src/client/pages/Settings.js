"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("../../client/api");
const utils_1 = require("../../client/utils");
const ui_1 = require("../../components/ui");
const lucide_react_1 = require("lucide-react");
const utils_2 = require("../../lib/utils");
function Settings() {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold tracking-tight", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430\u043C\u0438 \u0438 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u043C\u0438 \u0441\u043B\u043E\u0432\u0430\u043C\u0438" })] }), (0, jsx_runtime_1.jsx)(ui_1.Separator, {}), (0, jsx_runtime_1.jsxs)(ui_1.Tabs, { defaultValue: "sources", children: [(0, jsx_runtime_1.jsxs)(ui_1.TabsList, { children: [(0, jsx_runtime_1.jsx)(ui_1.TabsTrigger, { value: "sources", children: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438" }), (0, jsx_runtime_1.jsx)(ui_1.TabsTrigger, { value: "keywords", children: "\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430" }), (0, jsx_runtime_1.jsx)(ui_1.TabsTrigger, { value: "email", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0438 \u043E\u0442\u0447\u0435\u0442\u044B" })] }), (0, jsx_runtime_1.jsxs)(ui_1.TabsContent, { value: "sources", className: "space-y-4 mt-4", children: [(0, jsx_runtime_1.jsxs)(ui_1.Card, { children: [(0, jsx_runtime_1.jsxs)(ui_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(ui_1.CardTitle, { children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A" }), (0, jsx_runtime_1.jsx)(ui_1.CardDescription, { children: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u0434\u043B\u044F \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0430" })] }), (0, jsx_runtime_1.jsx)(ui_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleAddSource, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "sourceName", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430" }), (0, jsx_runtime_1.jsx)(ui_1.Input, { id: "sourceName", value: newSourceName, onChange: (e) => setNewSourceName(e.target.value), placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0430\u043B\u043E\u0433\u043E\u0432\u044B\u0439 \u043F\u043E\u0440\u0442\u0430\u043B" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "sourceUrl", children: "URL \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430" }), (0, jsx_runtime_1.jsx)(ui_1.Input, { id: "sourceUrl", value: newSourceUrl, onChange: (e) => setNewSourceUrl(e.target.value), placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: https://example.com \u0438\u043B\u0438 t.me/channel" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { htmlFor: "sourceType", children: "\u0422\u0438\u043F \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Button, { type: "button", variant: newSourceType === "website" ? "default" : "outline", onClick: () => setNewSourceType("website"), children: "\u0412\u0435\u0431-\u0441\u0430\u0439\u0442" }), (0, jsx_runtime_1.jsx)(ui_1.Button, { type: "button", variant: newSourceType === "telegram" ? "default" : "outline", onClick: () => setNewSourceType("telegram"), children: "Telegram-\u043A\u0430\u043D\u0430\u043B" })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Button, { type: "submit", disabled: addSourceMutation.isPending, children: addSourceMutation.isPending ? "Добавление..." : "Добавить источник" })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col space-y-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Label, { className: "text-lg font-semibold", children: "\u0413\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u043A\u0430 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-muted-foreground mb-2", children: "\u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u044B \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432 \u0434\u043B\u044F \u0443\u0434\u043E\u0431\u043D\u043E\u0433\u043E \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Input, { placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043D\u043E\u0432\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B", value: newGroupName, onChange: (e) => setNewGroupName(e.target.value) }), (0, jsx_runtime_1.jsxs)(ui_1.Button, { onClick: handleAddGroup, disabled: !newGroupName.trim(), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }), "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"] })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Separator, {}), (0, jsx_runtime_1.jsxs)(ui_1.Collapsible, { open: websiteGroupOpen, onOpenChange: setWebsiteGroupOpen, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium", children: "\u0412\u0435\u0431-\u0441\u0430\u0439\u0442\u044B" }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: (0, utils_2.cn)("h-4 w-4 transition-transform", websiteGroupOpen && "rotate-90") }) }) })] }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleContent, { children: (0, jsx_runtime_1.jsx)(ui_1.Card, { children: (0, jsx_runtime_1.jsx)(ui_1.CardContent, { className: "pt-4", children: isLoadingSources ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, i) => ((0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-8 w-full" }, i))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: websiteSources.map((source) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b pb-2 last:border-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: source.isEnabled, onCheckedChange: (checked) => {
                                                                                    toggleSourceMutation.mutate({
                                                                                        id: source.id,
                                                                                        isEnabled: checked,
                                                                                    });
                                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Label, { children: source.name })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground truncate max-w-[200px]", children: source.url }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 p-0", onClick: () => handleDeleteSource(source.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] }, source.id))) })) }) }) })] }), (0, jsx_runtime_1.jsxs)(ui_1.Collapsible, { open: telegramGroupOpen, onOpenChange: setTelegramGroupOpen, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium", children: "Telegram-\u043A\u0430\u043D\u0430\u043B\u044B" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: telegramSources.some((s) => s.isEnabled), onCheckedChange: (checked) => {
                                                                    toggleSourcesByTypeMutation.mutate({
                                                                        type: "telegram",
                                                                        isEnabled: checked,
                                                                    });
                                                                    toast({
                                                                        title: checked
                                                                            ? "Все Telegram-каналы включены"
                                                                            : "Все Telegram-каналы отключены",
                                                                    });
                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Badge, { children: telegramSources.length }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: (0, utils_2.cn)("h-4 w-4 transition-transform", telegramGroupOpen && "rotate-90") }) }) })] })] }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleContent, { children: (0, jsx_runtime_1.jsx)(ui_1.Card, { children: (0, jsx_runtime_1.jsx)(ui_1.CardContent, { className: "pt-4", children: isLoadingSources ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: Array.from({ length: 3 }).map((_, i) => ((0, jsx_runtime_1.jsx)(ui_1.Skeleton, { className: "h-8 w-full" }, i))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: telegramSources.map((source) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b pb-2 last:border-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: source.isEnabled, onCheckedChange: (checked) => {
                                                                                    toggleSourceMutation.mutate({
                                                                                        id: source.id,
                                                                                        isEnabled: checked,
                                                                                    });
                                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Label, { children: source.name })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground truncate max-w-[200px]", children: source.url }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 p-0", onClick: () => handleDeleteSource(source.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] }, source.id))) })) }) }) })] }), sourceGroups.map((group) => ((0, jsx_runtime_1.jsxs)(ui_1.Collapsible, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium", children: group.name }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: group.sources.some((s) => s.isEnabled), onCheckedChange: (checked) => {
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
                                                                } }), (0, jsx_runtime_1.jsx)(ui_1.Badge, { children: group.sources.length }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "icon", className: "text-destructive hover:text-destructive hover:bg-destructive/10", onClick: () => handleDeleteGroup(group.id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "ghost", size: "sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: "h-4 w-4" }) }) })] })] }), (0, jsx_runtime_1.jsx)(ui_1.CollapsibleContent, { children: (0, jsx_runtime_1.jsx)(ui_1.Card, { children: (0, jsx_runtime_1.jsx)(ui_1.CardContent, { className: "pt-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [group.sources.map((source) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b pb-2 last:border-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(ui_1.Switch, { checked: source.isEnabled, onCheckedChange: (checked) => {
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
exports.default = Settings;
