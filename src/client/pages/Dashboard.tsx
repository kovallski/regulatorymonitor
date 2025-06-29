import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Keyword, type NewsItem, type NewsResponse } from '../../client/api';
import { useToast } from '../../client/utils';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { DatePicker } from '../../components/ui/date-picker';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Filter, ChevronRight, FileText, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';

function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [filterKeywords, setFilterKeywords] = useState<string>("");
  const [sourceType, setSourceType] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Загружаем фильтры из localStorage при инициализации
  useEffect(() => {
    const savedDateFrom = localStorage.getItem('dateFrom');
    const savedDateTo = localStorage.getItem('dateTo');
    const savedKeywords = localStorage.getItem('filterKeywords');
    const savedSourceType = localStorage.getItem('sourceType');
    const savedItemsPerPage = localStorage.getItem('itemsPerPage');
    
    if (savedDateFrom) setDateFrom(new Date(savedDateFrom));
    if (savedDateTo) setDateTo(new Date(savedDateTo));
    if (savedKeywords) setFilterKeywords(savedKeywords);
    if (savedSourceType) setSourceType(savedSourceType);
    if (savedItemsPerPage) setItemsPerPage(parseInt(savedItemsPerPage));
  }, []);

  // Сохраняем фильтры в localStorage при их изменении
  useEffect(() => {
    if (dateFrom) {
      localStorage.setItem('dateFrom', dateFrom.toISOString());
    } else {
      localStorage.removeItem('dateFrom');
    }
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
  }, [dateFrom]);

  useEffect(() => {
    if (dateTo) {
      localStorage.setItem('dateTo', dateTo.toISOString());
    } else {
      localStorage.removeItem('dateTo');
    }
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
  }, [dateTo]);

  useEffect(() => {
    if (filterKeywords) {
      localStorage.setItem('filterKeywords', filterKeywords);
    } else {
      localStorage.removeItem('filterKeywords');
    }
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
  }, [filterKeywords]);

  useEffect(() => {
    if (sourceType) {
      localStorage.setItem('sourceType', sourceType);
    } else {
      localStorage.removeItem('sourceType');
    }
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
  }, [sourceType]);

  // Fetch news
  const { data: newsResponse, isLoading: isLoadingNews, error: newsError } = useQuery<NewsResponse>({
    queryKey: ['news', { dateFrom, dateTo, filterKeywords, sourceType, currentPage, itemsPerPage }],
    queryFn: () => apiClient.getNews({
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
      keywords: filterKeywords ? filterKeywords.split(',').map(k => k.trim()) : undefined,
      sourceType,
      page: currentPage,
      limit: itemsPerPage,
    }),
  });

  // Извлекаем данные из ответа
  const newsItems = newsResponse?.items || [];
  const pagination = newsResponse?.pagination;

  // Debug logging
  console.log('Dashboard - isLoadingNews:', isLoadingNews);
  console.log('Dashboard - newsItems count:', newsItems.length);
  console.log('Dashboard - newsError:', newsError);
  console.log('Dashboard - pagination:', pagination);
  if (newsItems.length > 0) {
    console.log('Dashboard - first news item:', newsItems[0]);
  }

  // Fetch keywords for suggestions
  const { data: keywords = [] } = useQuery<Keyword[]>({
    queryKey: ['keywords'],
    queryFn: apiClient.listKeywords,
  });

  // Task status for news processing
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  // Polling for task status
  const { data: processingStatus } = useQuery<{ status: string }>({
    queryKey: ['processingStatus', processingTaskId],
    queryFn: () => apiClient.getNewsProcessingStatus({ taskId: processingTaskId! }),
    enabled: !!processingTaskId,
    refetchInterval: processingTaskId ? 5000 : false,
  });

  // Fetch and process news mutation
  const fetchNewsMutation = useMutation({
    mutationFn: apiClient.fetchAndProcessNews,
    onSuccess: (data: any) => {
      if (data.taskId) {
        setProcessingTaskId(String(data.taskId));
      }
    },
  });

  // Export to Excel mutation
  const exportMutation = useMutation({
    mutationFn: apiClient.exportToExcel,
    onSuccess: (data: any) => {
      window.open(data.fileUrl, '_blank');
      toast({
        title: 'Отчет сгенерирован',
        description: `Экспортировано ${data.itemCount} новостей`,
      });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const removeKeywordMutation = useMutation({
    mutationFn: apiClient.removeKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: apiClient.deleteSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast({
        title: "Источник удален",
      });
    },
  });

  const handleRemoveKeyword = (id: string) => {
    removeKeywordMutation.mutate({ id });
  };

  const handleDeleteSource = (id: string) => {
    deleteSourceMutation.mutate({ id });
  };

  const handleFetchNews = () => {
    if (fetchNewsMutation.isPending) return;
    fetchNewsMutation.mutate({
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
      keywords: filterKeywords ? filterKeywords.split(',').map(k => k.trim()) : undefined,
      sourceType,
    });
  };

  const handleExport = () => {
    if (exportMutation.isPending) return;
    exportMutation.mutate({
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
      keywords: filterKeywords ? filterKeywords.split(',').map(k => k.trim()) : undefined,
    });
  };

  const handleResetFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setFilterKeywords("");
    setSourceType(undefined);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    const newLimit = parseInt(value);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении количества элементов
    localStorage.setItem('itemsPerPage', newLimit.toString());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
          <p className="text-muted-foreground">
            Мониторинг налоговых новостей и документов
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleFetchNews}
            disabled={fetchNewsMutation.isPending || !!processingTaskId}
          >
            {fetchNewsMutation.isPending ? "Загрузка..." : "Загрузить новости"}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? "Экспорт..." : "Экспорт в Excel"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Фильтры
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs"
            >
              Сбросить фильтры
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="dateFrom">Дата с</Label>
                <DatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Дата по</Label>
                <DatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  className="w-full mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sourceType" className="block mb-2">
                  Тип источника
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sourceType === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType(undefined)}
                  >
                    Все источники
                  </Button>
                  <Button
                    variant={sourceType === "website" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("website")}
                  >
                    Веб-сайты
                  </Button>
                  <Button
                    variant={sourceType === "telegram" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("telegram")}
                  >
                    Telegram
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="keywords">Ключевые слова</Label>
                <Input
                  id="keywords"
                  value={filterKeywords}
                  onChange={(e) => setFilterKeywords(e.target.value)}
                  placeholder="Введите ключевые слова через запятую"
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Items */}
      <div className="space-y-4">
        {isLoadingNews ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : newsError ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-600">
                <p>Ошибка загрузки новостей:</p>
                <p className="text-sm mt-2">{newsError.message}</p>
              </div>
            </CardContent>
          </Card>
        ) : newsItems.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                Нет новостей для отображения
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {newsItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {item.title}
                      </a>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{item.sourceName}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.summary}</p>
                {/* {item.keywords && item.keywords.map((keyword) => (
                  <Badge key={keyword.id}>{keyword.text}</Badge>
                ))} */}
              </CardContent>
            </Card>
          ))}

          {/* Пагинация */}
          {pagination && newsItems.length > 0 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="itemsPerPage" className="text-sm">Показать:</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      из {pagination.total} новостей
                    </span>
                  </div>

                  {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Назад
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pagination.page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Вперед
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 