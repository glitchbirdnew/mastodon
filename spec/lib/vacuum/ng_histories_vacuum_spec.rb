# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vacuum::NgHistoriesVacuum do
  subject { described_class.new }

  describe '#perform' do
    let!(:rule_history_old) { Fabricate(:ng_rule_history, created_at: 30.days.ago) }
    let!(:rule_history_recent) { Fabricate(:ng_rule_history, created_at: 2.days.ago) }

    before do
      subject.perform
    end

    it 'deletes old history' do
      expect { rule_history_old.reload }.to raise_error ActiveRecord::RecordNotFound
    end

    it 'does not delete recent history' do
      expect { rule_history_recent.reload }.to_not raise_error
    end
  end
end
