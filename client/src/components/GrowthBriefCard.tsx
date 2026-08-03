import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useGrowthBrief } from '@/hooks/useCustomerSegmentation';

export default function GrowthBriefCard() {
  const brief = useGrowthBrief();

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Jaqyn AI Growth Brief</h2>
          <span className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded-full ml-auto">{brief.period}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">₸{brief.totalRevenue}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Avg Daily</p>
            <p className="text-xl font-bold text-green-600">₸{brief.avgDailyRevenue}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Active Customers</p>
            <p className="text-xl font-bold text-blue-600">{brief.activeCustomers}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Retention Rate</p>
            <p className="text-xl font-bold text-purple-600">{brief.retentionRate}%</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg border border-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">{brief.quietHourAlert}</p>
              <p className="text-xs text-amber-800 mt-0.5">{brief.nextAction}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-red-100 rounded-lg border border-red-300">
            <Users className="w-4 h-4 text-red-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">{brief.atRiskCount} at-risk customers</p>
              <p className="text-xs text-red-800 mt-0.5">{brief.topOpportunity}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <TrendingUp className="w-4 h-4" />
            {brief.recommendation}
          </Button>
        </div>
      </div>
    </Card>
  );
}

