import BigNumber from 'bignumber.js';
import { fromHex, toHex, bcs } from "@mysten/bcs";
import * as template from '@mysten/move-bytecode-template';
import { getSimpleCoinByteCode, getRegCoinByteCode } from './bytecode'

// 定义包含所有常量的对象
const constants = {
    DECIMALS: { defaultValue: 44, type: 'U8' },
    SYMBOL: { defaultValue: 'TMPL', type: 'Vector(U8)' },
    NAME: { defaultValue: 'Template Coin', type: 'Vector(U8)' },
    DESCRIPTION: { defaultValue: 'Template Coin Description', type: 'Vector(U8)' },
    ICON_URL: { defaultValue: 'icon_url', type: 'Vector(U8)' },
    IS_META_DATA_MUT: { defaultValue: 55, type: 'U8' },
};

// 通用的序列化函数
function serializeValue(value, type) {
    switch (type) {
        case 'U8':
            return bcs.u8().serialize(value).toBytes();
        case 'U64':
            return bcs.u64().serialize(value).toBytes();
        case 'Vector(U8)':
            return bcs.string().serialize(value).toBytes();
        default:
            throw new Error(`不支持的类型: ${type}`);
    }
}

// 通用的更新函数
function updateConstant(modifiedByteCode, key, newValue) {
    const { defaultValue, type } = constants[key];
    return template.update_constants(
        modifiedByteCode,
        serializeValue(newValue, type),
        serializeValue(defaultValue, type),
        type
    );
}

// 更新函数示例
const updateDecimals = (modifiedByteCode, decimals = 9) =>
    updateConstant(modifiedByteCode, 'DECIMALS', decimals);

const updateSymbol = (modifiedByteCode, symbol) =>
    updateConstant(modifiedByteCode, 'SYMBOL', symbol.toUpperCase().trim());

const updateName = (modifiedByteCode, name) =>
    updateConstant(modifiedByteCode, 'NAME', name?.toLowerCase().trim());

const updateDescription = (modifiedByteCode, description) =>
    updateConstant(modifiedByteCode, 'DESCRIPTION', description.trim());

const updateUrl = (modifiedByteCode, iconUrl) =>
    updateConstant(modifiedByteCode, 'ICON_URL', iconUrl);

const updateIsMetaDataMut = (modifiedByteCode, isMetaDataMut) =>
    updateConstant(modifiedByteCode, 'IS_META_DATA_MUT', isMetaDataMut);

export const generateBytecode = async (info) => {
    let bytecode = ''
    if (info.coinType === 'simpleCoin') {
        bytecode = getSimpleCoinByteCode()
    } 
    if (info.coinType === 'RegionalCoin') {
        bytecode = getRegCoinByteCode()
    } 
  
    const templateByteCode = fromHex(bytecode);
  
    const modifiedByteCode = template.update_identifiers(templateByteCode, {
      TEMPLATE:  info.symbol.trim().toUpperCase().replaceAll(' ', '_'),
      template: info.symbol.trim().toLowerCase().replaceAll(' ', '_'),
      REGTEMPLATE:  info.symbol.trim().toUpperCase().replaceAll(' ', '_'),
      regtemplate: info.symbol.trim().toLowerCase().replaceAll(' ', '_')
    });
    
    let updated = modifiedByteCode;
  
    // 更新常量
    updated = updateDecimals(updated, info.decimals);
    updated = updateSymbol(updated, info.symbol);
    updated = updateName(updated, info.name);
    updated = updateDescription(updated, info.description ?? '');
    updated = updateUrl(updated, info.iconUrl ?? '');
    if (info.isMetaDataMut) {
        updated = updateIsMetaDataMut(updated, 0);
    } else {
        updated = updateIsMetaDataMut(updated, 1);
        
    }

    return updated;
};
