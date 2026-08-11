---
oj: dmy
pid: '251'
title: '[R41B]购物'
difficulty: 入门
tags:
  - 排序
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$，$1 \le W, a_i \le 10^9$。

## 思路

购买同样数量的商品时，选取价格更低的商品不会使总价变高。因此，若能购买 $k$ 件商品，购买价格最小的 $k$ 件也一定可行。

将所有价格按从小到大的顺序排序，依次购买。当前商品的价格超过剩余预算时，后续商品只会更贵，不能再多购买任何一件；此时已购买的数量就是答案。

复杂度：排序耗时 $O(n \log n)$，扫描耗时 $O(n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var money = first[1]
    let prices = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(prices)

    var count: Int64 = 0
    for (price in prices) {
        if (price > money) {
            break
        }
        money -= price
        count += 1
    }
    println(count)
    return 0
}
```
