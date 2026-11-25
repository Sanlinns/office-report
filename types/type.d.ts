
type IncomeType ={
    date:Date,
    amount:number,
    month:string,
    compamy:string,
    notice:string | null,
    createdAt:Date,
    _id:string,

}
type OutComeType = {
    _id: string,
    date:Date,
    amount:string,
    shop:string,
    bank:string,
    notice:string,
    createdAt:Date,
}


export type ChartBoxConfig = {
    title: string;
    subtitle?: string;
    number: string;
    percentage?: number; // positive for increase, negative for decrease
    dataKey?: string; // e.g. "income", "outcome", "profit"
    chartData: any[]; // e.g. [{ name: "Mon", income: 1000 }, ...]
}


export type MoneyRow = {
    amount: number;
    date?: string;
    createdAt?: string;
  };
  
  export type DailyPoint = {
    day: string; // YYYY-MM-DD
    income: number;
    outcome: number;
    profit: number;
  };